import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Actor {
  id: string;
  name: string;
  approved: boolean;
  bio?: string;
}

export default function ActorPage() {
  const [actors, setActors] = useState<Actor[]>([]);
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
      },
      {
        id: "2",
        name: "Jane Smith",
        approved: true,
        bio: "Jane has performed in numerous Tony Award-winning musicals over the past decade.",
      },
      {
        id: "3",
        name: "Michael Johnson",
        approved: false,
        bio: "Michael is a rising star in the musical theater scene with a powerful tenor voice.",
      },
    ];

    setActors(sampleActors);
    setLoading(false);

    // API call code would go here in a real implementation
    // fetch("/api/actors")
    //   .then(res => res.json())
    //   .then(data => {
    //     setActors(data);
    //     setLoading(false);
    //   })
    //   .catch(err => {
    //     console.error("Error fetching actors:", err);
    //     setLoading(false);
    //   });
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this actor?")) {
      try {
        // In a real app, make an API call to delete
        // await fetch(`/api/actors/${id}`, { method: 'DELETE' });

        // Update local state
        setActors(actors.filter((actor) => actor.id !== id));
      } catch (error) {
        console.error("Failed to delete actor:", error);
      }
    }
  };

  return (
    <PageTemplate
      title="Actors"
      actionButton={{
        label: "Add Actor",
        onClick: () => navigate("/actors/new"),
      }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading actors...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {actors.map((actor) => (
                <tr key={actor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {actor.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {actor.approved ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => navigate(`/actors/view/${actor.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/actors/edit/${actor.id}`)}
                      className="text-amber-600 hover:text-amber-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(actor.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageTemplate>
  );
}
