import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import { relationshipService, CreateRelationshipDto } from "../services/relationshipService";
import type { DataRecord } from "../types/registro";

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentRecord: DataRecord;
}

interface ChildRecordForm {
  codigo: string;
  longitud?: number;
  ubicacion?: string;
  cliente?: string;
  equipo?: string;
  seec?: string;
  tipo_linea?: string;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  parentRecord,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [relationshipType, setRelationshipType] = useState<"DIVISION" | "REPLACEMENT" | "UPGRADE">("DIVISION");
  const [notes, setNotes] = useState("");
  const [childRecords, setChildRecords] = useState<ChildRecordForm[]>([
    { codigo: "", longitud: parentRecord.longitud, ubicacion: parentRecord.ubicacion },
    { codigo: "", longitud: parentRecord.longitud, ubicacion: parentRecord.ubicacion },
  ]);

  const addNewLine = () => {
    setChildRecords(prev => [...prev, {
      codigo: "",
      longitud: parentRecord.longitud,
      ubicacion: parentRecord.ubicacion,
    }]);
  };

  const removeLine = (index: number) => {
    if (childRecords.length > 1) {
      setChildRecords(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateChildRecord = (index: number, field: string, value: any) => {
    setChildRecords(prev => prev.map((record, i) => 
      i === index ? { ...record, [field]: value } : record
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    const hasEmptyCode = childRecords.some(record => !record.codigo.trim());
    if (hasEmptyCode) {
      error("Error", "Todos los códigos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      const payload: CreateRelationshipDto = {
        parent_record_id: parseInt(parentRecord.id),
        relationship_type: relationshipType,
        notes: notes.trim() || undefined,
        child_records: childRecords.map(record => ({
          codigo: record.codigo.trim(),
          longitud: record.longitud || parentRecord.longitud,
          ubicacion: record.ubicacion || parentRecord.ubicacion,
          cliente: parentRecord.cliente,
          equipo: parentRecord.equipo,
          seec: parentRecord.seec,
          tipo_linea: parentRecord.tipo_linea,
        }))
      };

      const result = await relationshipService.createRelationship(payload);
      success("Éxito", result.message);
      onSuccess();
    } catch (err: any) {
      error("Error", err.message || "Error al crear las líneas derivadas");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Crear Líneas Derivadas</h2>
              <p className="text-blue-100">Línea: {parentRecord.codigo}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-blue-200">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de relación */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">Tipo de Operación</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "DIVISION" as const, label: "División", icon: "🔄" },
                { value: "REPLACEMENT" as const, label: "Reemplazo", icon: "↔️" },
                { value: "UPGRADE" as const, label: "Actualización", icon: "⬆️" },
              ].map(({ value, label, icon }) => (
                <label key={value} className="relative">
                  <input
                    type="radio"
                    name="relationship_type"
                    value={value}
                    checked={relationshipType === value}
                    onChange={(e) => setRelationshipType(e.target.value as any)}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50">
                    <div className="font-medium">{icon} {label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Nuevas líneas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Nuevas Líneas</h3>
              <Button type="button" onClick={addNewLine} size="sm" icon={Plus}>
                Agregar Línea
              </Button>
            </div>
            
            <div className="space-y-4">
              {childRecords.map((record, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Nueva Línea #{index + 1}</h4>
                    {childRecords.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeLine(index)}
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        className="text-red-600"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Código *"
                      value={record.codigo}
                      onChange={(e) => updateChildRecord(index, "codigo", e.target.value)}
                      placeholder="Código único"
                      required
                    />
                    <Input
                      label="Longitud (m)"
                      type="number"
                      value={record.longitud || ""}
                      onChange={(e) => updateChildRecord(index, "longitud", parseFloat(e.target.value) || undefined)}
                      placeholder="Metros"
                    />
                    <Input
                      label="Ubicación"
                      value={record.ubicacion || ""}
                      onChange={(e) => updateChildRecord(index, "ubicacion", e.target.value)}
                      placeholder="Nueva ubicación"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Notas (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Razón de la operación, cambios realizados, etc."
              maxLength={500}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Crear Líneas Derivadas
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
