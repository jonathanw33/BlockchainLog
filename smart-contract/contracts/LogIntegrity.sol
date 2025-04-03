// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LogIntegrity
 * @dev Stores Merkle roots of log batches for integrity verification
 */
contract LogIntegrity is Ownable {
    struct MerkleRootData {
        bytes32 root;
        uint256 timestamp;
    }
    
    mapping(uint256 => MerkleRootData) private merkleRoots;
    uint256 private nextBatchId = 1;
    
    event MerkleRootStored(uint256 indexed batchId, bytes32 merkleRoot, uint256 timestamp);
    
    /**
     * @dev Store a new Merkle root
     * @param _merkleRoot The Merkle root hash to store
     * @return The batch ID assigned to this Merkle root
     */
    function storeMerkleRoot(bytes32 _merkleRoot) external onlyOwner returns (uint256) {
        uint256 batchId = nextBatchId;
        merkleRoots[batchId] = MerkleRootData({
            root: _merkleRoot,
            timestamp: block.timestamp
        });
        
        emit MerkleRootStored(batchId, _merkleRoot, block.timestamp);
        
        nextBatchId++;
        return batchId;
    }
    
    /**
     * @dev Retrieve a stored Merkle root by batch ID
     * @param _batchId The batch ID to retrieve
     * @return The Merkle root and its timestamp
     */
    function getMerkleRoot(uint256 _batchId) external view returns (bytes32, uint256) {
        require(_batchId > 0 && _batchId < nextBatchId, "Invalid batch ID");
        MerkleRootData memory data = merkleRoots[_batchId];
        return (data.root, data.timestamp);
    }
    
    /**
     * @dev Get the latest batch ID
     * @return The latest batch ID (next batch ID - 1)
     */
    function getLatestBatchId() external view returns (uint256) {
        return nextBatchId - 1;
    }
}
