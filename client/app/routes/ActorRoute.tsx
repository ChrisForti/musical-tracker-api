import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Actor {
  id: string;
  name: string;
  approved: boolean;
  bio?: string;
  performances?: string[];
}

interface ActorDetailProps {
  actorId: string;
}

export default function ActorDetail({ actorId }: ActorDetailProps) {
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Sample data for testing
    const sampleActors = [
      {
        id: "1",
        name: "John Doe",
        approved: true,
        bio: "John is a versatile actor with experience in both Broadway and off-Broadway productions.",
        performances: [
          "Hamilton (2019-2020)",
          "The Phantom of the Opera (2017-2018)",
        ],
      },
      {
        id: "2",
        name: "Jane Smith",
        approved: true,
        bio: "Jane has performed in numerous Tony Award-winning musicals over the past decade.",
        performances: [
          "Chicago (2021)",
          "Wicked (2018-2020)",
          "Les Misérables (2015-2017)",
        ],
      },
      {
        id: "3",
        name: "Michael Johnson",
        approved: false,
        bio: "Michael is a rising star in the musical theater scene with a powerful tenor voice.",
        performances: ["Rent (2022)"],
      },
    ];

    // Find the actor by ID
    const foundActor = sampleActors.find((a) => a.id === actorId);

    if (foundActor) {
      setActor(foundActor);
    }

    setLoading(false);

    // In a real app, fetch from API
    // fetch(`/api/actors/${actorId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setActor(data);
    //     setLoading(false);
    //   })
    //   .catch(err => {
    //     console.error("Error fetching actor:", err);
    //     setLoading(false);
    //   });
  }, [actorId]);

  const handleDelete = async () => {
    if (!actor) return;

    if (confirm("Are you sure you want to delete this actor?")) {
      try {
        // In a real app, make an API call to delete
        // await fetch(`/api/actors/${actor.id}`, { method: 'DELETE' });

        // Navigate back to the list
        navigate("/actors");
      } catch (error) {
        console.error("Failed to delete actor:", error);
      }
    }
  };

  return (
    <PageTemplate
      title={actor?.name || "Actor Details"}
      backButton={{
        label: "Back to Actors",
        onClick: () => navigate("/actors"),
      }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading actor details...</div>
      ) : !actor ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          Actor not found.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {actor.name}
              </h1>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  actor.approved
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {actor.approved ? "Approved" : "Pending Approval"}
              </span>
            </div>

            {/* Actor biography */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                Biography
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {actor.bio || "No biography available."}
              </p>
            </div>

            {/* Actor performances */}
            {actor.performances && actor.performances.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Performance History
                </h2>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                  {actor.performances.map((performance, index) => (
                    <li key={index}>{performance}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
                onClick={() => navigate(`/actors/edit/${actor.id}`)}
              >
                Edit Actor
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                onClick={handleDelete}
              >
                Delete Actor
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
