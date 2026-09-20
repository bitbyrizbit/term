"use client";

import { useEffect, useState, useCallback } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getContractGraph } from "../../../../lib/api";
import Link from "next/link";
import dagre from "dagre";
import { Loader2 } from "lucide-react";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = "TB") => {
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
    node.targetPosition = "top";
    node.sourcePosition = "bottom";
    node.position = {
      x: nodeWithPosition.x - 125,
      y: nodeWithPosition.y - 50,
    };
    
    // Style nodes according to the new UI aesthetic
    const ntype = node.data?.type || 'obligation';
    let bgColor = '#fdfcf8';
    let borderColor = '#9c937b';
    let labelColor = '#15130e';
    
    if (ntype === 'trigger') {
       bgColor = '#fbf3ee'; borderColor = '#c97744'; labelColor = '#7d3a1c';
    } else if (ntype === 'consequence') {
       bgColor = 'rgba(194,91,62,0.1)'; borderColor = '#c25b3e'; labelColor = '#8a3621';
    } else if (ntype === 'condition') {
       bgColor = 'rgba(122,155,110,0.1)'; borderColor = '#5a7d50'; labelColor = '#44603b';
    }
    
    node.style = {
      background: bgColor,
      border: `1px solid ${borderColor}`,
      color: labelColor,
      borderRadius: '2px',
      padding: '12px',
      fontFamily: '"Inter Tight", system-ui, sans-serif',
      fontSize: '12px',
      width: 250,
    };
  });

  return { nodes, edges };
};

export default function KnowledgeGraph({ params }: { params: { id: string } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContractGraph((params.id.replace(/%20| /g, "-")))
      .then((data) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          data.nodes,
          data.edges
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      })
      .catch((err) => console.error(err)).finally(() => setLoading(false));
  }, [(params.id.replace(/%20| /g, "-"))]);

  return (
    <div className="max-w-8xl mx-auto px-6 lg:px-10 py-10">
      <div className="mb-10 pb-6 border-b border-ink-200 flex items-end justify-between">
        <div>
          <div className="num-label mb-2">DAG Viewer</div>
          <h1 className="font-display text-4xl tracking-tightish text-ink-900">Contract graph</h1>
          <p className="text-sm text-ink-500 mt-1">Interactive DAG visualization.</p>
        </div>
      </div>

      <div className="card overflow-hidden relative" style={{ height: '600px' }}>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            className="bg-paper-100"
          >
            <Background color="#d8d3c5" gap={24} size={1.5} />
            <Controls className="bg-paper-50 border border-ink-200 rounded-sm" />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}


