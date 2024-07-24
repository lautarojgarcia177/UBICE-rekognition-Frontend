"use client";

import Dropzone from "react-dropzone";
import { useState, useRef } from "react";
import { Button, Tooltip } from "@chakra-ui/react";
import { CircleX, Upload } from "lucide-react";

export default function FilesUpload({ onUploadPhotos, disableSubmit }) {
  const [photos, setPhotos] = useState<File[] | null>(null);
  function handleDrop(selectedFiles: File[]) {
    setPhotos(selectedFiles);
  }
  function handleClearSelection() {
    setPhotos(null);
  }
  const activeStyle = {
    borderColor: "blue",
    color: "black",
  };
  const baseStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem",
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "#eeeeee",
    borderStyle: "dashed",
    backgroundColor: "#fafafa",
    color: "#bdbdbd",
    outline: "none",
    transition: "border .24s ease-in-out",
  };
  const dropzoneRef = useRef<HTMLDivElement | null>(null);
  function setActiveStyle() {
    if (dropzoneRef.current) {
      dropzoneRef.current.style.borderColor = activeStyle.borderColor;
      dropzoneRef.current.style.color = activeStyle.color;
    }
  }
  function setDefaultStyle() {
    if (dropzoneRef.current) {
      dropzoneRef.current.style.borderColor = baseStyle.borderColor;
      dropzoneRef.current.style.color = baseStyle.color;
    }
  }
  return (
    <>
      {!photos && (
        <Dropzone
          accept={{ "image/jpg": [".jpg"] }}
          onDrop={handleDrop}
          multiple
          maxFiles={1000}
        >
          {({ getRootProps, getInputProps }) => {
            return (
              <div
                {...getRootProps({ style: baseStyle })}
                onDragEnter={setActiveStyle}
                onDragLeave={setDefaultStyle}
                onMouseEnter={setActiveStyle}
                onMouseLeave={setDefaultStyle}
                ref={dropzoneRef}
                className="cursor-pointer"
              >
                <input {...getInputProps()} />
                <Upload />
                <p>
                  Arrastra las imagenes aquí o haz click para seleccionarlas
                </p>
              </div>
            );
          }}
        </Dropzone>
      )}
      {photos && (
        <>
          <div className="flex items-center">
            <p>
              {photos.length} Foto{photos.length > 1 && "s"} seleccionada
              {photos.length > 1 && "s"}
            </p>
            <Tooltip label="Quitar seleccion" placement="right">
              <Button
                colorScheme="red"
                variant="ghost"
                onClick={handleClearSelection}
              >
                <CircleX />
              </Button>
            </Tooltip>
          </div>
          <Button
            isDisabled={!photos || disableSubmit}
            onClick={() => onUploadPhotos(photos)}
          >
            Subir fotos
          </Button>
        </>
      )}
    </>
  );
}
