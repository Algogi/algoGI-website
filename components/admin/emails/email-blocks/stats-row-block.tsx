"use client";

import React from "react";
import { StatsRowBlockProps, StatItem } from "@/lib/types/email";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface StatsRowBlockComponentProps {
  block: {
    id: string;
    type: "stats-row";
    props: StatsRowBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: StatsRowBlockProps) => void;
  isPreview?: boolean;
}

export default function StatsRowBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: StatsRowBlockComponentProps) {
  const {
    stats = [
      { value: "100+", label: "Customers" },
      { value: "50+", label: "Projects" },
      { value: "99%", label: "Satisfaction" },
    ],
    valueColor = "#4a3aff",
    labelColor = "#666666",
    valueSize = "32px",
    labelSize = "14px",
    backgroundColor = "#f5f5f5",
    columns = 3,
  } = block.props;

  const handleAddStat = () => {
    if (onUpdate) {
      onUpdate({
        ...block.props,
        stats: [...stats, { value: "0", label: "New Stat" }],
      });
    }
  };

  const handleRemoveStat = (index: number) => {
    if (onUpdate && stats.length > 1) {
      onUpdate({
        ...block.props,
        stats: stats.filter((_, i) => i !== index),
      });
    }
  };

  const handleStatChange = (index: number, field: keyof StatItem, value: string) => {
    if (onUpdate) {
      const newStats = [...stats];
      newStats[index] = { ...newStats[index], [field]: value };
      onUpdate({
        ...block.props,
        stats: newStats,
      });
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    padding: "40px 20px",
    ...block.styles,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: "20px",
    textAlign: "center",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: valueSize,
    fontWeight: "bold",
    color: valueColor,
    marginBottom: "5px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: labelSize,
    color: labelColor,
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        <div style={gridStyle}>
          {stats.map((stat, index) => (
            <div key={index}>
              {stat.icon && <img src={stat.icon} alt="" style={{ width: "30px", height: "30px", marginBottom: "10px" }} />}
              <div style={valueStyle}>{stat.value}</div>
              <div style={labelStyle}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`border-2 transition-colors ${
        isSelected
          ? "border-neon-blue bg-neon-blue/10"
          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      style={containerStyle}
    >
      <div style={gridStyle}>
        {stats.map((stat, index) => (
          <div key={index}>
            {stat.icon && <img src={stat.icon} alt="" style={{ width: "30px", height: "30px", marginBottom: "10px" }} />}
            {isSelected && onUpdate ? (
              <>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => handleStatChange(index, "value", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-neon-blue focus:outline-none mb-1"
                  style={valueStyle}
                />
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => handleStatChange(index, "label", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-neon-blue focus:outline-none"
                  style={labelStyle}
                />
              </>
            ) : (
              <>
                <div style={valueStyle}>{stat.value}</div>
                <div style={labelStyle}>{stat.label}</div>
              </>
            )}
            {isSelected && onUpdate && stats.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveStat(index);
                }}
                className="mt-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      {isSelected && onUpdate && (
        <div className="text-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddStat();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stat
          </Button>
        </div>
      )}
    </div>
  );
}


