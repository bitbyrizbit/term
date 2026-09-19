"use client";

import { useEffect, useState, useCallback } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getContractGraph } from "../../../../lib/api";
import Link from "next/link";
import dagre from "dagre";

// Simple dagre layout
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";
    node.position = {
      x: nodeWithPosition.x - 250 / 2,
      y: nodeWithPosition.y - 100 / 2,
    };
    return node;
  });

  return { nodes, edges };
};

export default function KnowledgeGraph({ params }: { params: { id: string } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContractGraph(params.id)
      .then((data) => {
        // Map types to generic or custom types
        const initialNodes = data.nodes.map((n: any) => ({
          ...n,
          type: "default", // use default for now, can customize
          style: getNodeStyle(n.data.type),
          data: { label: formatNodeLabel(n.data) }
        }));
        
        const initialEdges = data.edges.map((e: any) => ({
          ...e,
          animated: e.label === "depends_on" || e.label === "conflicts_with",
          style: { stroke: e.label === "conflicts_with" ? "#ef4444" : "#94a3b8" }
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-8">Loading graph...</div>;

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Knowledge Graph</h1>
        </div>
        <div className="flex gap-4">
          <Link href={`/contracts/${params.id}`} className="text-sm text-blue-600 hover:underline">Document View</Link>
          <Link href={`/contracts/${params.id}/obligations`} className="text-sm text-blue-600 hover:underline">Command Center</Link>
        </div>
      </div>
      <div className="flex-grow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

function getNodeStyle(type: string) {
  switch (type) {
    case "Party":
      return { background: "#f8fafc", border: "2px solid #cbd5e1", borderRadius: "50%", width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' };
    case "Clause":
      return { background: "#ffffff", border: "2px solid #e2e8f0", borderRadius: "8px", padding: 10 };
    case "Obligation":
      return { background: "#eff6ff", border: "2px solid #bfdbfe", borderRadius: "8px", padding: 10 };
    case "Deadline":
      return { background: "#fef2f2", border: "2px solid #fecaca", borderRadius: "8px", padding: 10 };
    case "Event":
      return { background: "#fffbeb", border: "2px solid #fde68a", borderRadius: "0px", transform: "rotate(45deg)" }; // Mock diamond
    default:
      return {};
  }
}

function formatNodeLabel(data: any) {
  if (data.type === "Event") {
    return <div style={{ transform: "rotate(-45deg)" }}>{data.label}</div>;
  }
  if (data.type === "Clause") return `Clause: ${data.label}`;
  return data.label;
}
