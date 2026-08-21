<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\Laravel\Facades\Image;

class ImageService
{
    public function storeWebP(UploadedFile $file, string $folder): string
    {
        $image = Image::decodePath($file->getRealPath());

        if ($image->width() > 1200) {
            $image->scale(width: 1200);
        }

        $filename = $folder.'/'.Str::random(32).'.webp';
        $encoded = $image->encode(new WebpEncoder(quality: 85));

        Storage::disk('public')->put($filename, (string) $encoded);

        return Storage::disk('public')->url($filename);
    }
}
