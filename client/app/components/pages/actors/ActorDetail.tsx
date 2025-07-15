// /Users/fortis/repos/musical-tracker-api/client/app/routes/actors/$id.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Actor {
  id: string;
  name: string;
  approved: boolean;
}

export default function ActorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/actor/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setActor(data.actor);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!actor) return <div>Actor not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{actor.name}</h1>
      <p>Status: {actor.approved ? "Approved" : "Pending"}</p>

      <div className="mt-4">
        <button
          onClick={() => navigate("/actors")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
        >
          Back to Actors
        </button>
      </div>
    </div>
  );
}
