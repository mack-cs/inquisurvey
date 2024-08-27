<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSurveyAnswerRequest;
use App\Models\Survey;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\SurveyQuestion;
use App\Http\Enums\QuestionTypeEnum;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rules\Enum;
use App\Http\Resources\SurveyResource;
use App\Http\Requests\StoreSurveyRequest;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\UpdateSurveyRequest;
use App\Models\SurveyAnswers;
use App\Models\SurveyQuestionAnswer;

class SurveyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        return SurveyResource::collection(
            Survey::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10)
        );
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSurveyRequest $request)
    {
        $data = $request->validated();

        // Check if image was given amd save on local file system
        if (isset($data['image'])) {
            $relativePath = $this->saveImage($data['image']);
            $data['image'] = $relativePath;
        }

        $survey = Survey::create($data);

        // Create new questions
        foreach($data['questions'] as $question) {
            $question['survey_id'] = $survey->id;
            $this->createQuestion($question);
        }

        return new SurveyResource($survey);
    }

    private function createQuestion($data)
    {
        if(is_array($data['data'])) {
            $data['data'] = json_encode($data['data']);
        }

        $validator = Validator::make($data, [
            'question' => 'required|string',
            'type' => ['required', new Enum(QuestionTypeEnum::class)],
            'description' => 'nullable|string',
            'data' => 'present',
            'survey_id' => 'exists:App\Models\Survey,id'
        ]);

        return SurveyQuestion::create($validator->validated());
    }

    private function saveImage($image) {
        // Check if image is valid base64 string
        if(preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            // Take out the base64 encoded text without mime type
            $image = substr($image, strpos($image, ',') + 1);
            // Get file extension
            $type = strtolower($type[1]); // jpg, png, gif

            // Check if file is a image
            if(!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
               throw new \Exception('Invalid image type');
            }
            $image = str_replace(' ', '+', $image);
            $image = base64_decode($image);

            if($image === false) {
                throw new \Exception('base64_decode failed!');
            }
        } else {
            throw new \Exception('Did not match data URI with image data');
        }

        $dir = 'images/';
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;
        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }
        file_put_contents($relativePath, $image);
        return $relativePath;
    }

    private function saveImage2($image) {
        // Check if the provided string is a valid base64-encoded image
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            // Extract the base64 encoded data (remove the data:image/type;base64, part)
            $image = substr($image, strpos($image, ',') + 1);

            // Replace any spaces with '+' as spaces can be present in base64 encoding
            $image = str_replace(' ', '+', $image);

            // Decode the base64 string to binary data
            $image = base64_decode($image);

            // Check if decoding was successful
            if ($image === false) {
                // If decoding failed, throw an exception with an appropriate message
                throw new \InvalidArgumentException('Base64 decoding failed for the image.');
            }

            // Get the MIME type of the decoded image data
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_buffer($finfo, $image);
            finfo_close($finfo);

            // Define allowed MIME types and their corresponding file extensions
            $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif'];

            // Check if the MIME type of the image is in the allowed list
            if (!isset($allowedTypes[$mimeType])) {
                // If the MIME type is not allowed, throw an exception
                throw new \InvalidArgumentException('Invalid image type');
            }

            // Set the file extension based on the MIME type
            $type = $allowedTypes[$mimeType];
        } else {
            // If the string does not match the expected pattern, throw an exception
            throw new \InvalidArgumentException('Did not match data URI with image data');
        }

        // Define the directory where the image will be saved (in storage/app/images)
        $dir = storage_path('app/images/');

        // Generate a unique filename using UUID and a timestamp to avoid collisions
        $file = Str::uuid() . '_' . time() . '.' . $type;

        // Check if the directory exists, if not, create it with appropriate permissions
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        // Save the binary image data to a file in the defined directory
        file_put_contents($dir . $file, $image);

        // Return the URL to the saved image file for easy access in views or responses
        return url('storage/images/' . $file);
    }

    /**
     * Display the specified resource.
     */
    public function show(Survey $survey, Request $request)
    {
        $user = $request->user();
        if($user->id !== $survey->user_id) {
            return abort(403, "Unauthorized action");
        }
        return new SurveyResource($survey);
    }

    public function getBySlug(Survey $survey) {
        if (!$survey->status) {
            return response()->json([
                'message' => "We're sorry, but this survey is currently unavailable."
            ], 404);
        }

        $currentDate = new \DateTime();
        $expiryDate = new \DateTime($survey->expiry_date);
        if($currentDate > $expiryDate) {
            return response()->json([
                'message' => "We're sorry, but this survey has expired and is no longer available."
            ], 404);
        }

        return new SurveyResource($survey);
    }

    public function storeAnswer(StoreSurveyAnswerRequest $request, Survey $survey){
        $validated = $request->validated();

        $surveyAnswer = SurveyAnswers::create([
            'survey_id' => $survey->id,
            'start_date' => date('Y-m-d H:i:s'),
            'end_date' => date('Y-m-d H:i:s')
        ]);

        foreach ($validated['answers'] as $questionId => $answer) {
            $question = SurveyQuestion::where(['id' => $questionId, 'survey_id' => $survey->id])->get();
            if (!$question) {
                return response("Invalid question ID: \"$questionId\"", 400);
            }

            $data = [
                'survey_question_id' => $questionId,
                'survey_answer_id' => $surveyAnswer->id,
                'answer' => is_array($answer) ? json_encode($answer) : $answer
            ];

            $questionAnswer = SurveyQuestionAnswer::create($data);
        }

        return response("Thank you. Your answer to this survey was recorded successfully!", 201);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSurveyRequest $request, Survey $survey)
    {
        $data = $request->validated();

        // Check if image was given and save on local file system
        if(isset($data['image'])) {
            $relativePath =  $this->saveImage($data['image']);
            $data['image'] = $relativePath;

            // If there is an old image, delete it
            if($survey->image) {
                $absolutePath = public_path($survey->image);
                File::delete($absolutePath);
            }
        }

        // Update survey in the database
        $survey->update($data);

        // Get ids as plain array of existing questions
        $existingIds = $survey->questions()->pluck('id')->toArray();

        // Get ids as plain array of new questions
        $newIds = Arr::pluck($data['questions'], 'id');

        // Find questions to delete
        $toDelete = array_diff($existingIds, $newIds);

        // Find questions to add
        $toAdd = array_diff($newIds, $existingIds);

        // Delete questions by $toDelete array
        SurveyQuestion::destroy($toDelete);

        // Create new questions
        foreach ($data['questions'] as $question) {
            if(in_array($question['id'], $toAdd)) {
                $question['survey_id'] = $survey->id;
                $this->createQuestion($question);
            }
        }

        // Update existing questions
        $questionMap = collect($data['questions'])->keyBy('id');
        foreach ($survey->questions as $question) {
            if (isset($questionMap[$question->id])) {
                $this->updateQuestion($question, $questionMap[$question->id]);
            }
        }

        return new SurveyResource($survey);
    }

    private function updateQuestion(SurveyQuestion $question, $data)
    {
        if (is_array($data['data'])) {
            $data['data'] = json_encode($data['data']);
        }
        $validator = Validator::make(
            $data, [
                'id' => 'exists:survey_questions,id',
                'question' => 'required|string',
                'type' => ['required', new Enum(QuestionTypeEnum::class)],
                'description' => 'nullable|string',
                'data'=>'present',
            ]
            );

            return $question->update($validator->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Survey $survey, Request $request)
    {
        $user = $request->user();
        if($user->id !== $survey->user_id) {
            return abort(403, 'Unauthorized action.');
        }

        $survey->delete();

        // If there is an old image, delete it
        if ($survey->image) {
            $absolutePath = public_path($survey->image);
            File::delete($absolutePath);
        }
        return response('',204);
    }
}
