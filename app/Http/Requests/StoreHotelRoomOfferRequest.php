<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Hotel;
use App\Models\HotelRoomOffer;

class StoreHotelRoomOfferRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'hotel_id'        => $this->integer('hotel_id'),
            'room_type_id'    => $this->integer('room_type_id'),
            'accommodation_id'=> $this->integer('accommodation_id'),
        ]);
    }

    public function rules(): array
    {
        return [
            'hotel_id'         => ['required','exists:hotels,id'],
            'room_type_id'     => ['required','exists:room_types,id'],
            'accommodation_id' => ['required','exists:accommodations,id',
                // Único por hotel+tipo+acomodación
                Rule::unique('hotel_room_offers')->where(fn($q) => $q
                    ->where('hotel_id', $this->hotel_id)
                    ->where('room_type_id', $this->room_type_id)
                ),
            ],
            'quantity'   => ['required','integer','min:0'],
            'base_price' => ['nullable','numeric','min:0'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            // Regla: sum(quantity) + nueva <= hotel.max_rooms
            $hotel = Hotel::find($this->hotel_id);
            if (!$hotel || $hotel->max_rooms === null) return;

            $current = HotelRoomOffer::where('hotel_id', $this->hotel_id)->sum('quantity');
            $newTotal = $current + (int)$this->quantity;

            if ($newTotal > $hotel->max_rooms) {
                $v->errors()->add('quantity', "La suma de cantidades ($newTotal) excede el máximo del hotel ({$hotel->max_rooms}).");
            }
        });
    }
}

