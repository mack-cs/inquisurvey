<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSurveyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }


    protected function prepareForValidation(){
        $this->merge([
            'user_id' => $this->user()->id
        ]);
    }
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => 'exists:users,id',
            'image' => 'nullable:string',
            'title' => 'required|string|max:1000',
            'status' => 'required|boolean',
            'description' => 'nullable|string',
            'expiry_date' => 'nullable|date|after:today',
            'questions' => 'array'
        ];
    }
}
