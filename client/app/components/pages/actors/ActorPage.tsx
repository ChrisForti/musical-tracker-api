// /Users/fortis/repos/musical-tracker-api/client/app/routes/ActorPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Actor {
  id: string;
  name: string;
  approved: boolean;
}

export default function ActorPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch actors from your API
    fetch("/api/v1/actor")
      .then((res) => res.json())
      .then((data) => {
        setActors(data.actors || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching actors:", err);
        setLoading(false);
      });
  }, []);

  return (
    <PageTemplate
      title="Actors"
      actionButton={{
        label: "Add Actor",
        onClick: () => navigate("/actors/new"),
      }}
    >
      {loading ? (
        <div>Loading actors...</div>
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
                      onClick={() => navigate(`/actors/${actor.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/actors/${actor.id}/edit`)}
                      className="text-amber-600 hover:text-amber-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        /* Delete logic */
                      }}
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
