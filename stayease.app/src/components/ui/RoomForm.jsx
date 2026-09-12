import { useState, useEffect } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";
import { Label } from "./label";

export default function RoomForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    numero: "",
    tipo: "",
    capacidade: "",
    status: "Livre",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // RQ007: Validação e mensagem de erro clara
    if (!formData.numero || !formData.tipo || !formData.capacidade) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    setError("");
    onSubmit(formData);
    setFormData({ numero: "", tipo: "", capacidade: "", status: "Livre" });
  };

  return (
    <Card className="p-6 mb-8 w-full max-w-2xl mx-auto shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">
        {initialData ? "Editar Quarto" : "Cadastrar Novo Quarto"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número do Quarto</Label>
            <Input
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="Ex: 101"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Input
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              placeholder="Ex: Standard, Luxo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacidade">Capacidade (Pessoas)</Label>
            <Input
              id="capacidade"
              name="capacidade"
              type="number"
              value={formData.capacidade}
              onChange={handleChange}
              placeholder="Ex: 2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            >
              <option value="Livre">Livre</option>
              <option value="Ocupado">Ocupado</option>
              <option value="Limpeza Pendente">Limpeza Pendente</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          {initialData && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">
            {initialData ? "Salvar Alterações" : "Cadastrar Quarto"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
