"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  isTemplate: boolean;
  order: number;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch("/api/cms/portfolio");
      if (!response.ok) throw new Error("Failed to fetch portfolio");
      const data = await response.json();
      setPortfolio(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this portfolio item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/cms/portfolio/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");
      fetchPortfolio();
    } catch (err: any) {
      alert("Error deleting portfolio item: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-white">
            Portfolio
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage your portfolio items and case studies
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button asChild>
            <Link href="/admin/portfolio/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Portfolio Item
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-dark-card shadow overflow-hidden sm:rounded-md border border-neon-blue/20">
        <ul className="divide-y divide-neon-blue/20">
          {portfolio.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-400">
              No portfolio items yet.{" "}
              <Link
                href="/admin/portfolio/new"
                className="text-neon-blue hover:underline"
              >
                Create your first one
              </Link>
              .
            </li>
          ) : (
            portfolio.map((item) => (
              <li key={item.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-white">
                        {item.title}
                      </h3>
                      <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                        {item.isTemplate ? "Template" : "AI Solution"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      {item.client}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/portfolio/${item.id}`}
                      className="inline-flex items-center px-3 py-2 border border-neon-blue/30 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-dark-surface hover:bg-dark-surface/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center px-3 py-2 border border-red-600 shadow-sm text-sm leading-4 font-medium rounded-md text-red-400 bg-dark-surface hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

