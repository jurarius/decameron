<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHotelRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        // Si vienes de PUT /hotels/{hotel}, esto trae el id a ignorar
        $hotelId = $this->route('hotel')?->id;

        return [
            'name'       => [
                'required','string','max:150',
                Rule::unique('hotels', 'name')->ignore($hotelId),
            ],
            'city_id'    => ['nullable','exists:cities,id'],
            'nit'        => [
                'nullable','string','max:50',
                Rule::unique('hotels', 'nit')->ignore($hotelId),
            ],
            'max_rooms'  => ['nullable','integer','min:0'],
            'address'    => ['nullable','string','max:200'],
            'phone'      => ['nullable','string','max:50'],
            'email'      => ['nullable','email','max:150'],
        ];
    }
}
