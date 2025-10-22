"use client";

import { useState } from "react";
import { Procedure } from "@/types/patient";

interface EditProcedureModalProps {
  procedure: Procedure;
  onClose: () => void;
  onEdit: (procedure: Procedure) => void;
}

export default function EditProcedureModal({
  procedure,
  onClose,
  onEdit,
}: EditProcedureModalProps) {
  const [formData, setFormData] = useState({
    name: procedure.name,
    date: procedure.date,
    doctor: procedure.doctor,
    price: procedure.price.toString(),
    moneyPaid: procedure.moneyPaid.toString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProcedure: Procedure = {
      ...procedure,
      name: formData.name,
      date: formData.date,
      doctor: formData.doctor,
      price: parseFloat(formData.price) || 0,
      moneyPaid: parseFloat(formData.moneyPaid) || 0,
    };

    onEdit(updatedProcedure);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Edit Procedure</h2>
        <button
          onClick={onClose}
          className="text-2xl leading-none hover:text-gray-600 transition"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Procedure Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="E.g., Cleaning, Root Canal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor
          </label>
          <input
            type="text"
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter doctor name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Money Paid
          </label>
          <input
            type="number"
            name="moneyPaid"
            value={formData.moneyPaid}
            onChange={handleChange}
            step="0.01"
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>

        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
          <p>
            Balance: $
            {(
              parseFloat(formData.price) - parseFloat(formData.moneyPaid) || 0
            ).toFixed(2)}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
