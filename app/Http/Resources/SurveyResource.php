<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class SurveyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
           'id' => $this->id,
           'title' => $this->title,
           'slug' => $this->slug,
           'image_url' => $this->image ? URL::to($this->image) : null,
           'status' => !!$this->status,
           'description' => $this->description,
           'created_at' => Carbon::parse($this->created_at)->format('Y-m-d H:i:s'),
           'updated_at' => Carbon::parse($this->updated_at)->format('Y-m-d H:i:s'),
           'expiry_date' => $this->expiry_date? Carbon::parse($this->expiry_date)->format('Y-m-d') : null,
           'questions' => SurveyQuestionResource::collection($this->questions),
        ];
    }
}
