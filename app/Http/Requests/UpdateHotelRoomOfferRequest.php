<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Hotel;
use App\Models\HotelRoomOffer;

class UpdateHotelRoomOfferRequest extends FormRequest
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
        $offerId = $this->route('hotel_room_offer')?->id ?? $this->route('hotel_room_offer');

        return [
            'hotel_id'         => ['required','exists:hotels,id'],
            'room_type_id'     => ['required','exists:room_types,id'],
            'accommodation_id' => ['required','exists:accommodations,id',
                Rule::unique('hotel_room_offers')->ignore($offerId)->where(fn($q) => $q
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
            $offer = $this->route('hotel_room_offer');
            $offerId = is_object($offer) ? $offer->id : (int)$offer;

            $hotel = Hotel::find($this->hotel_id);
            if (!$hotel || $hotel->max_rooms === null) return;

            $sumOther = HotelRoomOffer::where('hotel_id', $this->hotel_id)
                ->where('id', '!=', $offerId)
                ->sum('quantity');

            $newTotal = $sumOther + (int)$this->quantity;

            if ($newTotal > $hotel->max_rooms) {
                $v->errors()->add('quantity', "La suma de cantidades ($newTotal) excede el máximo del hotel ({$hotel->max_rooms}).");
            }
        });
    }
};