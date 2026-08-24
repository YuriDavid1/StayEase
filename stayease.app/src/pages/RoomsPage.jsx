import RoomForm from "../components/ui/RoomForm";
import RoomList from "../components/ui/RoomList";
import { useState } from "react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([
    {
      id: 1,
      numero: "101",
      tipo: "Standard",
      capacidade: "2",
      status: "Livre",
    },
    {
      id: 2,
      numero: "102",
      tipo: "Standard",
      capacidade: "2",
      status: "Ocupado",
    },
    {
      id: 3,
      numero: "201",
      tipo: "Luxo",
      capacidade: "4",
      status: "Limpeza Pendente",
    },
  ]);

  const [editingRoom, setEditingRoom] = useState(null);

  const handleSaveRoom = (roomData) => {
    if (editingRoom) {
      setRooms(
        rooms.map((room) =>
          room.id === editingRoom.id ? { ...roomData, id: room.id } : room,
        ),
      );
      setEditingRoom(null);
    } else {
      const newRoom = { ...roomData, id: Date.now() }; // Gera ID mockado
      setRooms([...rooms, newRoom]);
    }
  };

  const handleDeleteRoom = (id) => {
    setRooms(rooms.filter((room) => room.id !== id));
  };

  const handleEditClick = (room) => {
    setEditingRoom(room);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingRoom(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Gestão de Quartos
          </h1>
          <p className="text-slate-500 mt-2">
            Área do Administrador - Sistema de Gestão de Hospedagem
          </p>
        </header>

        <section>
          <RoomForm
            onSubmit={handleSaveRoom}
            initialData={editingRoom}
            onCancel={handleCancelEdit}
          />
        </section>

        <section>
          <RoomList
            rooms={rooms}
            onEdit={handleEditClick}
            onDelete={handleDeleteRoom}
          />
        </section>
      </div>
    </div>
  );
}
