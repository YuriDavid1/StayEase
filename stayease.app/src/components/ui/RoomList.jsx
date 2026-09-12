import { Button } from "./button";
import { Card } from "./card";

export default function RoomList({ rooms, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Livre":
        return "bg-green-100 text-green-800 border-green-200";
      case "Ocupado":
        return "bg-red-100 text-red-800 border-red-200";
      case "Limpeza Pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Quartos Cadastrados
      </h2>

      {rooms.length === 0 ? (
        <p className="text-slate-500 text-center py-8">
          Nenhum quarto cadastrado no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-800">
                    Quarto {room.numero}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(room.status)}`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="space-y-1 mb-6 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-700">Tipo:</span>{" "}
                    {room.tipo}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">
                      Capacidade:
                    </span>{" "}
                    {room.capacidade} pessoas
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 w-full">
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={() => onEdit(room)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  className="w-1/2 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Tem certeza que deseja excluir o quarto ${room.numero}?`,
                      )
                    ) {
                      onDelete(room.id);
                    }
                  }}
                >
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
