"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Star, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SpaceImage } from "./types";

const MAX_IMAGES = 8;
let imageCounter = 0;

export function ImageUploader({
  value,
  onChange,
}: {
  value: SpaceImage[];
  onChange: (next: SpaceImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const images = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!images.length) return;

    const room = MAX_IMAGES - value.length;
    if (room <= 0) {
      toast.error(`You can add up to ${MAX_IMAGES} photos per space.`);
      return;
    }
    const accepted = images.slice(0, room);
    if (images.length > room) {
      toast.info(`Only the first ${room} photo(s) were added (max ${MAX_IMAGES}).`);
    }

    const next = accepted.map((file) => ({
      id: `img-${imageCounter++}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    onChange([...value, ...next]);
  }

  function removeImage(id: string) {
    const target = value.find((img) => img.id === id);
    if (target) URL.revokeObjectURL(target.url);
    onChange(value.filter((img) => img.id !== id));
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
      }}
      className={cn(
        "rounded-xl transition-colors",
        isDragging && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((img, index) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden rounded-xl border bg-muted"
          >
            <Image
              src={img.url}
              alt={img.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 33vw, 160px"
              className="object-cover"
            />
            {/* Cover badge on the first image */}
            {index === 0 && (
              <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                <Star className="size-2.5 fill-current" />
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeImage(img.id)}
              aria-label="Remove photo"
              className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-md bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {/* Add tile */}
        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
          >
            <ImagePlus className="size-5" />
            <span className="text-xs font-medium">Add photo</span>
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {value.length > 0
          ? `${value.length} of ${MAX_IMAGES} added · first photo is the cover`
          : `Drag & drop or click to upload up to ${MAX_IMAGES} photos`}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
