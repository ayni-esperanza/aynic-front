import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  X,
  Eye,
  Image as ImageIcon,
  Camera,
  CheckCircle,
  Info,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import { useToast } from "../../ui/Toast";
import { useApi } from "../../../hooks/useApi";
import {
  imageService,
  type ImageResponse,
} from "../../../services/imageService";

interface ImageUploadProps {
  recordId: string;
  recordCode: string;
  currentImage?: ImageResponse | null;
  initialImage?: ImageResponse | null;
  skipInitialLoad?: boolean;
  onImageUploaded?: (image: ImageResponse) => void;
  onImageDeleted?: () => void;
  disabled?: boolean;
  className?: string;
  readOnly?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  recordId,
  recordCode,
  currentImage: externalCurrentImage,
  initialImage,
  skipInitialLoad = false,
  onImageUploaded,
  onImageDeleted,
  disabled = false,
  className = "",
  readOnly = false,
}) => {
  const { success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Referencias para evitar cargas duplicadas
  const isLoadingImageRef = useRef(false);
  const hasLoadedImageRef = useRef(false);
  const loadedRecordIdRef = useRef<string | null>(null);
  const attemptedLoadsRef = useRef<Set<string>>(new Set());

  // Estados locales
  const [currentImage, setCurrentImage] = useState<ImageResponse | null>(
    initialImage || externalCurrentImage || null
  );
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [description, setDescription] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);

  // Hook para cargar imagen existente
  const { loading: loadingImage, execute: loadImage } = useApi(
    (...args: unknown[]) => imageService.getRecordImage(args[0] as string),
    {
      onSuccess: (image) => {
        setCurrentImage(image);
        hasLoadedImageRef.current = true;
        isLoadingImageRef.current = false;
      },
      onError: (error: any) => {
        // Silenciar errores 404 para imágenes (es normal que no existan)
        if (
          !error?.message?.includes("404") &&
          !error?.message?.includes("Not Found")
        ) {
          console.warn("Error loading image:", error);
        }
        isLoadingImageRef.current = false;
        hasLoadedImageRef.current = true; // Marcar como intentado
      },
    }
  );

  // Hook para subir imagen
  const { loading: uploading, execute: uploadImage } = useApi(
    (...args: unknown[]) => {
      const { file, recordId, description } = args[0] as {
        file: File;
        recordId: string;
        description?: string;
      };
      return imageService.uploadImage(recordId, file, { description });
    },
    {
      onSuccess: (image) => {
        setCurrentImage(image);
        setPreviewFile(null);
        setPreviewUrl("");
        setDescription("");
        success("Imagen subida exitosamente");
        onImageUploaded?.(image);
      },
      onError: (error) => {
        showError("Error al subir imagen", error);
      },
    }
  );

  // Hook para reemplazar imagen
  const { loading: replacing, execute: replaceImage } = useApi(
    (...args: unknown[]) => {
      const { file, recordId, description } = args[0] as {
        file: File;
        recordId: string;
        description?: string;
      };
      return imageService.replaceImage(recordId, file, { description });
    },
    {
      onSuccess: (image) => {
        setCurrentImage(image);
        setPreviewFile(null);
        setPreviewUrl("");
        setDescription("");
        success("Imagen reemplazada exitosamente");
        onImageUploaded?.(image);
      },
      onError: (error) => {
        showError("Error al reemplazar imagen", error);
      },
    }
  );

  // Hook para eliminar imagen
  const { loading: deleting, execute: deleteImage } = useApi(
    (...args: unknown[]) => imageService.deleteRecordImage(args[0] as string),
    {
      onSuccess: () => {
        setCurrentImage(null);
        success("Imagen eliminada exitosamente");
        onImageDeleted?.();
      },
      onError: (error) => {
        showError("Error al eliminar imagen", error);
      },
    }
  );

  // Hook para actualizar metadatos
  const { loading: updatingMetadata, execute: updateMetadata } = useApi(
    (...args: unknown[]) => {
      const { recordId, description } = args[0] as {
        recordId: string;
        description: string;
      };
      return imageService.updateImageMetadata(recordId, { description });
    },
    {
      onSuccess: (image) => {
        setCurrentImage(image);
        success("Descripción actualizada");
      },
      onError: (error) => {
        showError("Error al actualizar descripción", error);
      },
    }
  );

  // Resetear referencias cuando cambia el recordId
  useEffect(() => {
    if (loadedRecordIdRef.current !== recordId) {
      hasLoadedImageRef.current = false;
      isLoadingImageRef.current = false;
      loadedRecordIdRef.current = recordId;

      // Solo resetear currentImage si no hay imagen externa
      if (!externalCurrentImage && !initialImage) {
        setCurrentImage(null);
      }
    }
  }, [recordId, externalCurrentImage, initialImage]);

  // Cargar imagen al montar el componente (con control anti-duplicados)
  useEffect(() => {
    // Solo cargar una vez por recordId y evitar intentos duplicados
    if (
      recordId &&
      !skipInitialLoad &&
      !externalCurrentImage &&
      !initialImage &&
      !isLoadingImageRef.current &&
      !hasLoadedImageRef.current &&
      !attemptedLoadsRef.current.has(recordId)
    ) {
      isLoadingImageRef.current = true;
      hasLoadedImageRef.current = true; // Marcar como intentado inmediatamente
      attemptedLoadsRef.current.add(recordId); // Marcar como intentado
      loadImage(recordId);
    }
  }, [recordId, skipInitialLoad, externalCurrentImage, initialImage]);

  // Sincronizar con imagen externa
  useEffect(() => {
    if (
      externalCurrentImage !== undefined &&
      externalCurrentImage !== currentImage
    ) {
      setCurrentImage(externalCurrentImage);
    }
  }, [externalCurrentImage]);

  // Limpiar preview URL al desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handlers
  const handleFileSelect = useCallback(
    (file: File) => {
      // Validar archivo
      const validation = imageService.validateImageFile(file);
      if (!validation.valid) {
        showError("Archivo inválido", validation.errors.join(", "));
        return;
      }

      setPreviewFile(file);

      // Crear URL de preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    },
    [previewUrl, showError]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!previewFile) return;

    if (currentImage) {
      // Reemplazar imagen existente
      await replaceImage({ file: previewFile, recordId, description });
    } else {
      // Subir nueva imagen
      await uploadImage({ file: previewFile, recordId, description });
    }
  }, [
    previewFile,
    currentImage,
    recordId,
    description,
    replaceImage,
    uploadImage,
  ]);

  const handleCancelPreview = useCallback(() => {
    setPreviewFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setDescription("");

    // Limpiar input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  const isProcessing = uploading || replacing || deleting || updatingMetadata;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Imagen actual */}
      {currentImage && !previewFile && (
        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={currentImage.image_url}
              alt={
                currentImage.description || `Imagen del registro ${recordCode}`
              }
              className="object-cover w-full h-64 transition-opacity cursor-pointer hover:opacity-90"
              onClick={() => setShowImageModal(true)}
            />
            <div className="absolute flex space-x-1 top-2 right-2">
              <Button
                 type="button"
                 size="sm"
                 variant="outline"
                 className="text-gray-700 border-gray-300 bg-white/90 hover:bg-white"
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   setShowImageModal(true);
                 }}
                 icon={Eye}
                 title="Ver imagen completa"
               >
                 Ver
              </Button>
              {!readOnly && (
                <>
                   <Button
                     type="button"
                     size="sm"
                     variant="outline"
                     className="text-blue-700 border-blue-300 bg-white/90 hover:bg-white"
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       fileInputRef.current?.click();
                     }}
                     icon={Upload}
                     title="Reemplazar imagen"
                     disabled={isProcessing}
                   >
                     Reemplazar
                   </Button>
                   <Button
                     type="button"
                     size="sm"
                     variant="outline"
                     className="text-red-700 border-red-300 bg-white/90 hover:bg-white"
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       deleteImage(recordId);
                     }}
                     icon={X}
                     title="Eliminar imagen"
                     disabled={isProcessing}
                     loading={deleting}
                   >
                     Eliminar
                   </Button>
                </>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="mb-1 font-medium text-gray-900">
                  {currentImage.original_name}
                </h4>
                {currentImage.description && (
                  <p className="mb-2 text-sm text-gray-600">
                    {currentImage.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" size="sm">
                    {imageService.formatFileSize(currentImage.file_size)}
                  </Badge>
                  <Badge variant="secondary" size="sm">
                    {currentImage.mime_type.split("/")[1].toUpperCase()}
                  </Badge>
                  {currentImage.compression_info && (
                    <Badge variant="success" size="sm">
                      {currentImage.compression_info.compression_ratio.toFixed(
                        1
                      )}
                      % comprimida
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {currentImage.compression_info && (
              <div className="p-2 text-xs text-gray-500 rounded bg-gray-50">
                <div className="flex items-center mb-1 space-x-1">
                  <Info size={12} />
                  <span className="font-medium">
                    Información de compresión:
                  </span>
                </div>
                <div>
                  Tamaño original:{" "}
                  {imageService.formatFileSize(
                    currentImage.compression_info.original_size
                  )}{" "}
                  → Comprimida:{" "}
                  {imageService.formatFileSize(
                    currentImage.compression_info.compressed_size
                  )}
                  ({currentImage.compression_info.savings_kb}KB ahorrados)
                </div>
                <div>
                  Dimensiones: {currentImage.compression_info.dimensions.width}×
                  {currentImage.compression_info.dimensions.height}px, Calidad:{" "}
                  {currentImage.compression_info.quality}%
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Vista previa del archivo seleccionado - NO MOSTRAR EN READONLY */}
      {!readOnly && previewFile && (
        <Card className="border-blue-200 bg-blue-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-blue-900">
                {currentImage ? "Reemplazar imagen" : "Nueva imagen"}
              </h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancelPreview();
                }}
                icon={X}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            </div>

            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="object-cover w-full h-48 border border-blue-200 rounded-lg"
              />

              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-blue-900">
                    Descripción{" "}
                    <span className="text-gray-500">(opcional)</span>
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe la imagen..."
                    disabled={isProcessing}
                    className="border-blue-200 focus:border-blue-400"
                    maxLength={500}
                  />
                </div>

                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <CheckCircle size={16} />
                  <span>Archivo: {previewFile.name}</span>
                  <Badge variant="secondary" size="sm">
                    {imageService.formatFileSize(previewFile.size)}
                  </Badge>
                </div>

                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUpload();
                  }}
                  loading={isProcessing}
                  disabled={isProcessing}
                  className="w-full"
                  icon={Upload}
                >
                  {isProcessing
                    ? currentImage
                      ? "Reemplazando..."
                      : "Subiendo..."
                    : currentImage
                    ? "Reemplazar imagen"
                    : "Subir imagen"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Área de subida - NO MOSTRAR EN READONLY */}
      {!readOnly && !currentImage && !previewFile && (
        <Card
          className={`border-2 border-dashed transition-all duration-200 ${
            dragOver
              ? "border-[#18D043] bg-[#18D043]/5"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <div
            className="p-8 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {loadingImage ? (
              <div className="space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600">Verificando imagen...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>

                <div>
                  <h4 className="mb-2 text-lg font-medium text-gray-900">
                    Subir imagen del registro
                  </h4>
                  <p className="mb-4 text-gray-600">
                    Arrastra una imagen aquí o haz clic para seleccionar
                  </p>
                  <p className="mb-4 text-sm text-gray-500">
                    Formatos admitidos: JPG, JPEG, PNG • Máximo 10MB
                    <br />
                    La imagen será comprimida automáticamente para optimizar el
                    almacenamiento
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={disabled || loadingImage}
                  icon={Camera}
                  className="bg-gradient-to-r from-[#18D043] to-[#16a34a]"
                >
                  Seleccionar imagen
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* MENSAJE CUANDO NO HAY IMAGEN EN MODO READONLY */}
      {readOnly && !currentImage && (
        <Card className="border-2 border-gray-300 border-dashed">
          <div className="p-16 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="mb-3 text-xl font-medium text-gray-900">
              Sin imagen disponible
            </h4>
            <p className="max-w-sm mx-auto text-gray-500">
              No se ha asociado ninguna imagen a este registro.
            </p>
          </div>
        </Card>
      )}

      {/* Input file oculto - NO EN READONLY */}
      {!readOnly && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isProcessing}
        />
      )}

      {/* Modal para ver imagen completa */}
      {showImageModal && currentImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative max-w-4xl max-h-full">
            <Button
               className="absolute z-10 text-white top-4 right-4 bg-black/50 hover:bg-black/70"
               onClick={() => setShowImageModal(false)}
               icon={X}
               size="sm"
             >
               Cerrar
            </Button>
            <img
              src={currentImage.image_url}
              alt={
                currentImage.description || `Imagen del registro ${recordCode}`
              }
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {currentImage.description && (
              <div className="absolute p-3 text-white rounded-lg bottom-4 left-4 right-4 bg-black/70">
                <p className="text-sm">{currentImage.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};