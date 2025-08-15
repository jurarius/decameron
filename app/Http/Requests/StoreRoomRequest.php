<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'hotel_id'             => ['required','exists:hotels,id'],
            'hotel_room_offer_id'  => [
                'required',
                Rule::exists('hotel_room_offers','id')->where(fn($q)=>$q->where('hotel_id',$this->hotel_id))
            ],
            'numeration' => ['nullable','string','max:30'],
            'floor'   => ['nullable','integer'],
            'status' => ['required','in:available,occupied,maintenance'],
        ];
    }
}
