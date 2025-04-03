import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Tooltip, Alert } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

const MerkleVisualizer = ({ logs = [], height = 300, selectedLog = null, verificationResult = null }) => {
  const [treeElements, setTreeElements] = useState([]);
  const [treeConnections, setTreeConnections] = useState([]);
  const [blockchainConnected, setBlockchainConnected] = useState(false);
  
  // Calculate tree dimensions based on number of logs
  const logCount = logs.length || 4; // Default to 4 if no logs
  const maxVisibleLogs = 8; // Maximum logs to display
  const actualLogCount = Math.min(logCount, maxVisibleLogs);
  
  // For a complete binary tree
  const leafCount = Math.pow(2, Math.ceil(Math.log2(actualLogCount)));
  const levels = Math.ceil(Math.log2(leafCount)) + 1;
  
  // Highlight path for the selected log (if verification result exists)
  const highlightedLogId = selectedLog?.id;
  const isVerified = verificationResult?.verified;
  
  useEffect(() => {
    buildTree();
  }, [logs, selectedLog, verificationResult]);
  
  const truncateHash = (hash) => {
    if (!hash || hash.length <= 10) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };
  
  const buildTree = () => {
    const elements = [];
    const connections = [];
    
    // Colors
    const nodeColors = {
      root: 'primary.main',
      intermediate: 'secondary.main',
      leaf: 'info.main',
      highlighted: 'success.main',
      tampered: 'error.main',
      blockchain: '#673ab7', // Deep purple for blockchain
    };
    
    // Draw blockchain node
    elements.push(
      <Box
        key="blockchain"
        sx={{
          position: 'absolute',
          top: '10px',
          left: '20%',
          width: '120px',
          height: '50px',
          backgroundColor: nodeColors.blockchain,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          fontSize: '12px',
          boxShadow: 2,
          flexDirection: 'column',
          padding: '4px'
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Blockchain</Typography>
        <Typography variant="caption" sx={{ fontSize: '9px' }}>
          {verificationResult ? 'Connected' : 'Testnet'}
        </Typography>
      </Box>
    );
    
    // Draw root node
    elements.push(
      <Tooltip 
        title={verificationResult?.merkleRoot || "Merkle Root Hash"} 
        arrow
        placement="top"
      >
        <Box
          key="root"
          sx={{
            position: 'absolute',
            top: '10px',
            left: '55%',
            width: '140px',
            height: '50px',
            backgroundColor: isVerified === false ? nodeColors.tampered : nodeColors.root,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            fontSize: '12px',
            boxShadow: 2,
            flexDirection: 'column',
            padding: '4px',
            border: isVerified === false ? '2px solid red' : 'none'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Merkle Root</Typography>
          <Typography variant="caption" sx={{ fontSize: '9px' }}>
            {verificationResult?.merkleRoot ? truncateHash(verificationResult.merkleRoot) : "Hash Value"}
          </Typography>
        </Box>
      </Tooltip>
    );
    
    // Connect blockchain to root
    connections.push(
      <Box
        key="blockchain-connection"
        sx={{
          position: 'absolute',
          top: '35px',
          left: '24%',
          width: '31%',
          height: '2px',
          backgroundColor: verificationResult ? (isVerified ? 'success.main' : 'error.main') : 'grey.500',
          zIndex: 1
        }}
      />
    );
    
    // Draw intermediate level nodes
    if (levels > 2) {
      const levelSpacing = height / (levels + 1);
      
      // For each level in the tree (excluding root and leaves)
      for (let level = 1; level < levels - 1; level++) {
        const nodesInLevel = Math.pow(2, level);
        const nodeWidth = 100;
        const levelY = levelSpacing * level + 10;
        
        // Calculate total width needed for this level
        const totalWidth = nodesInLevel * nodeWidth * 1.5; // 1.5 for spacing
        const startX = '50%';
        const translateX = -totalWidth / 2;
        
        // Add each node in this level
        for (let i = 0; i < nodesInLevel; i++) {
          const nodeX = `calc(${startX} + ${translateX}px + ${i * nodeWidth * 1.5}px)`;
          
          // Check if this node is on the highlight path
          const isHighlighted = highlightedLogId && i % 2 === 0;
          
          elements.push(
            <Box
              key={`node-${level}-${i}`}
              sx={{
                position: 'absolute',
                top: `${levelY}px`,
                left: nodeX,
                width: '90px',
                height: '35px',
                backgroundColor: isHighlighted ? 
                  (isVerified === false ? nodeColors.tampered : nodeColors.highlighted) : 
                  nodeColors.intermediate,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                fontSize: '10px',
                boxShadow: 1,
                border: isHighlighted && isVerified === false ? '2px solid red' : 'none'
              }}
            >
              <Typography variant="caption">
                Hash {level}-{i+1}
              </Typography>
            </Box>
          );
          
          // Connect to parent node in previous level (if not the first level)
          if (level > 1) {
            const parentIndex = Math.floor(i / 2);
            const parentLevel = level - 1;
            const parentY = levelSpacing * parentLevel + 10;
            const parentNodesInLevel = Math.pow(2, parentLevel);
            const parentTotalWidth = parentNodesInLevel * nodeWidth * 1.5;
            const parentTranslateX = -parentTotalWidth / 2;
            const parentX = `calc(${startX} + ${parentTranslateX}px + ${parentIndex * nodeWidth * 1.5}px)`;
            
            const isHighlightedConnection = highlightedLogId && i % 2 === 0;
            
            connections.push(
              <Box
                key={`conn-${parentLevel}-${parentIndex}-${level}-${i}`}
                sx={{
                  position: 'absolute',
                  top: `${parentY + 35}px`,
                  left: nodeX,
                  width: '2px',
                  height: `${levelY - parentY - 35}px`,
                  backgroundColor: isHighlightedConnection ? 
                    (isVerified === false ? 'error.main' : 'success.main') : 
                    'grey.500',
                  zIndex: 1,
                  transform: i % 2 === 0 ? 'translateX(45px) rotate(30deg)' : 'translateX(45px) rotate(-30deg)',
                  transformOrigin: 'top'
                }}
              />
            );
          } else {
            // Connect to root node
            const rootY = 10 + 50; // root node's top + height
            
            const isHighlightedConnection = highlightedLogId && i % 2 === 0;
            
            connections.push(
              <Box
                key={`conn-root-${i}`}
                sx={{
                  position: 'absolute',
                  top: `${rootY}px`,
                  left: i % 2 === 0 ? '50%' : '60%',
                  width: '2px',
                  height: `${levelY - rootY}px`,
                  backgroundColor: isHighlightedConnection ? 
                    (isVerified === false ? 'error.main' : 'success.main') : 
                    'grey.500',
                  zIndex: 1,
                  transform: i % 2 === 0 ? 'translateX(-20px) rotate(30deg)' : 'translateX(0px) rotate(-30deg)',
                  transformOrigin: 'top'
                }}
              />
            );
          }
        }
      }
    }
    
    // Draw leaf nodes (representing logs)
    const nodeWidth = 110;
    const leafY = height - 50;
    const totalWidth = leafCount * nodeWidth * 1.2; // tighter spacing for leaves
    const startX = '50%';
    const translateX = -totalWidth / 2;
    
    // Add each leaf node
    for (let i = 0; i < leafCount; i++) {
      // Find the corresponding log if available
      const log = i < logs.length ? logs[i] : null;
      const hasLog = !!log;
      
      const nodeX = `calc(${startX} + ${translateX}px + ${i * nodeWidth * 1.2}px)`;
      
      // Check if this log is selected for verification
      const isHighlighted = log && log.id === highlightedLogId;
      
      elements.push(
        <Tooltip 
          title={log ? `${log.level}: ${log.message}` : "Empty Leaf"} 
          arrow
          placement="top"
        >
          <Box
            key={`leaf-${i}`}
            sx={{
              position: 'absolute',
              top: `${leafY}px`,
              left: nodeX,
              width: '100px',
              height: '40px',
              backgroundColor: !hasLog ? 'grey.400' : 
                isHighlighted ? 
                  (isVerified === false ? nodeColors.tampered : nodeColors.highlighted) : 
                  nodeColors.leaf,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              fontSize: '10px',
              opacity: hasLog ? 1 : 0.5,
              boxShadow: hasLog ? 1 : 0,
              flexDirection: 'column',
              border: isHighlighted && isVerified === false ? '2px solid red' : 'none'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {hasLog ? log.level : 'Empty'} Log
            </Typography>
            {hasLog && (
              <Typography variant="caption" sx={{ fontSize: '8px', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.message.substring(0, 20)}{log.message.length > 20 ? '...' : ''}
              </Typography>
            )}
          </Box>
        </Tooltip>
      );
      
      // Connect to parent node
      if (levels > 2) {
        const parentLevel = levels - 2;
        const parentIndex = Math.floor(i / 2);
        const parentY = height / (levels + 1) * parentLevel + 10;
        const parentNodesInLevel = Math.pow(2, parentLevel);
        const parentNodeWidth = 100;
        const parentTotalWidth = parentNodesInLevel * parentNodeWidth * 1.5;
        const parentTranslateX = -parentTotalWidth / 2;
        const parentX = `calc(${startX} + ${parentTranslateX}px + ${parentIndex * parentNodeWidth * 1.5}px)`;
        
        const isHighlightedConnection = isHighlighted;
        
        connections.push(
          <Box
            key={`conn-${parentLevel}-${parentIndex}-leaf-${i}`}
            sx={{
              position: 'absolute',
              top: `${parentY + 35}px`,
              left: nodeX,
              width: '2px',
              height: `${leafY - parentY - 35}px`,
              backgroundColor: !hasLog ? 'grey.300' : 
                isHighlightedConnection ? 
                  (isVerified === false ? 'error.main' : 'success.main') : 
                  'grey.500',
              zIndex: 1,
              transform: i % 2 === 0 ? 'translateX(50px) rotate(30deg)' : 'translateX(50px) rotate(-30deg)',
              transformOrigin: 'top',
              opacity: hasLog ? 1 : 0.5
            }}
          />
        );
      } else {
        // Connect to root node directly
        const rootY = 10 + 50; // root node's top + height
        
        const isHighlightedConnection = isHighlighted;
        
        connections.push(
          <Box
            key={`conn-root-leaf-${i}`}
            sx={{
              position: 'absolute',
              top: `${rootY}px`,
              left: nodeX,
              width: '2px',
              height: `${leafY - rootY}px`,
              backgroundColor: !hasLog ? 'grey.300' : 
                isHighlightedConnection ? 
                  (isVerified === false ? 'error.main' : 'success.main') : 
                  'grey.500',
              zIndex: 1,
              transform: `translateX(50px) rotate(${i % 2 === 0 ? 20 : -20}deg)`,
              transformOrigin: 'top',
              opacity: hasLog ? 1 : 0.5
            }}
          />
        );
      }
    }
    
    setTreeElements(elements);
    setTreeConnections(connections);
  };
  
  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">
          Merkle Tree Visualization
        </Typography>
        <Tooltip title="Each log is hashed and forms a leaf in the Merkle tree. Hashes are combined pairwise up to the root, which is stored on the blockchain.">
          <InfoIcon color="info" />
        </Tooltip>
      </Box>
      
      {verificationResult && (
        <Alert 
          severity={verificationResult.verified ? "success" : "error"} 
          sx={{ mb: 2 }}
        >
          {verificationResult.verified 
            ? "Log verified successfully! The green path shows the verification chain." 
            : "Verification failed! The red path shows where integrity was broken."}
        </Alert>
      )}
      
      <Box
        sx={{
          position: 'relative',
          height: `${height}px`,
          width: '100%',
          overflow: 'hidden',
          border: '1px solid #eee',
          borderRadius: 1,
          backgroundColor: '#fafafa'
        }}
      >
        {/* Draw connections first (so they appear behind nodes) */}
        {treeConnections}
        {/* Then draw node elements */}
        {treeElements}
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {logs.length} log(s) in this visualization {logs.length > maxVisibleLogs ? `(showing first ${maxVisibleLogs})` : ''}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: 'success.main', mr: 0.5, borderRadius: '50%' }} />
            <Typography variant="caption">Valid Path</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: 'error.main', mr: 0.5, borderRadius: '50%' }} />
            <Typography variant="caption">Invalid Path</Typography>
          </Box>
        </Box>
      </Box>
      
      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', textAlign: 'center' }}>
        This visualization demonstrates how log entries are cryptographically linked to the blockchain via Merkle trees
      </Typography>
    </Paper>
  );
};

export default MerkleVisualizer;
