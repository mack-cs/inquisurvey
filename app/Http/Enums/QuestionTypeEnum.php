<?php

namespace  App\Http\Enums;

enum QuestionTypeEnum: string
{
    case Text = 'text';
    case Textarea = 'textarea';
    case Select = 'select';
    case Radio = 'radio';
    case Checkbox = 'checkbox';
}
