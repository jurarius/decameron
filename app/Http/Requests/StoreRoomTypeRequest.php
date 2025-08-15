<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomTypeRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return ['name'=>['required','string','max:120'],'description'=>['nullable','string']];
    }
}
