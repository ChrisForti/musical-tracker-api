import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Musical {
  id: string;
  title: string;
  composer: string;
  lyricist: string;
  approved: boolean;
  synopsis?: string;
}

interface MusicalDetailProps {
  musicalId: string;
}

export default function MusicalDetail({ musicalId }: MusicalDetailProps) {
  const [musical, setMusical] = useState<Musical | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Sample data for testing
    const sampleMusicals = [
      {
        id: "1",
        title: "Hamilton",
        composer: "Lin-Manuel Miranda",
        lyricist: "Lin-Manuel Miranda",
        approved: true,
        synopsis:
          "A musical about the life of American Founding Father Alexander Hamilton.",
      },
      {
        id: "2",
        title: "The Phantom of the Opera",
        composer: "Andrew Lloyd Webber",
        lyricist: "Charles Hart",
        approved: true,
        synopsis:
          "A musical about a disfigured musical genius who haunts the Paris Opera House.",
      },
      {
        id: "3",
        title: "Les Misérables",
        composer: "Claude-Michel Schönberg",
        lyricist: "Alain Boublil",
        approved: false,
        synopsis: "A musical adaptation of Victor Hugo's revolutionary novel.",
      },
    ];

    // Find the musical by ID
    const foundMusical = sampleMusicals.find((m) => m.id === musicalId);

    if (foundMusical) {
      setMusical(foundMusical);
    }

    setLoading(false);

    // In a real app, fetch from API
    // fetch(`/api/musicals/${musicalId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setMusical(data);
    //     setLoading(false);
    //   })
    //   .catch(err => {
    //     console.error("Error fetching musical:", err);
    //     setLoading(false);
    //   });
  }, [musicalId]);

  const handleDelete = async () => {
    if (!musical) return;

    if (confirm("Are you sure you want to delete this musical?")) {
      try {
        // In a real app, make an API call to delete
        // await fetch(`/api/musicals/${musical.id}`, { method: 'DELETE' });

        // Navigate back to the list
        navigate("/musicals");
      } catch (error) {
        console.error("Failed to delete musical:", error);
      }
    }
  };

  return (
    <PageTemplate
      title={musical?.title || "Musical Details"}
      backButton={{
        label: "Back to Musicals",
        onClick: () => navigate("/musicals"),
      }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading musical details...</div>
      ) : !musical ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          Musical not found.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {musical.title}
              </h1>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  musical.approved
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {musical.approved ? "Approved" : "Pending Approval"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Details
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-medium">Composer:</span>{" "}
                    {musical.composer}
                  </div>
                  <div>
                    <span className="font-medium">Lyricist:</span>{" "}
                    {musical.lyricist}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Synopsis
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {musical.synopsis || "No synopsis available."}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
                onClick={() => navigate(`/musicals/edit/${musical.id}`)}
              >
                Edit Musical
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                onClick={handleDelete}
              >
                Delete Musical
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
