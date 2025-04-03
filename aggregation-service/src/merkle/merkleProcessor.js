/**
 * Merkle Processor
 * 
 * Handles Merkle tree creation and verification
 */

const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

/**
 * Hash a log entry for inclusion in the Merkle tree
 * @param {Object} log The log entry to hash
 * @returns {Buffer} The hash of the log entry
 */
function hashLog(log) {
  // Create a normalized string representation
  const normalized = JSON.stringify({
    timestamp: log.timestamp,
    level: log.level,
    message: log.message,
    source: log.source
  });
  
  // Hash using keccak256 (compatible with Ethereum)
  return keccak256(normalized);
}

/**
 * Process a batch of logs into a Merkle tree
 * @param {Array} logs Array of log entries
 * @returns {Object} The Merkle root and proofs for each log
 */
function processBatch(logs) {
  if (!logs || logs.length === 0) {
    throw new Error('No logs to process');
  }
  
  console.log(`Creating Merkle tree from ${logs.length} logs`);
  
  // Add an ID to each log for reference
  const logsWithIds = logs.map((log, index) => ({
    ...log,
    id: `log_${index + 1}`
  }));
  
  // Create leaf nodes by hashing each log
  const leaves = logsWithIds.map(log => hashLog(log));
  
  // Create the Merkle tree
  const tree = new MerkleTree(leaves, keccak256, {
    sortPairs: true, // Sort pairs for deterministic results
    hashLeaves: false // Leaves are already hashed
  });
  
  // Get the Merkle root
  const merkleRoot = tree.getHexRoot();
  
  console.log(`Merkle root: ${merkleRoot}`);
  
  // Generate proof for each log
  const merkleProofs = {};
  
  logsWithIds.forEach((log, index) => {
    const leaf = leaves[index];
    const proof = tree.getHexProof(leaf);
    
    merkleProofs[log.id] = {
      index,
      hash: '0x' + leaf.toString('hex'),
      proof
    };
  });
  
  return {
    merkleRoot,
    merkleProofs,
    logs: logsWithIds
  };
}

/**
 * Verify a log entry against a Merkle root
 * @param {Object} log The log entry to verify
 * @param {Object} proof The Merkle proof for the log
 * @param {String} root The Merkle root to verify against
 * @returns {Object} Object with verified status and reason if failed
 */
function verifyLog(log, proof, root) {
  try {
    // For debugging - use safe JSON.stringify with error handling
    try {
      console.log("Verifying log:", JSON.stringify(log));
    } catch (e) {
      console.log("Verifying log: [Error stringifying log]");
    }
    
    console.log("Stored hash from proof:", proof.hash);
    
    // Calculate the hash just like we did when creating the tree
    // This ensures consistent hashing
    const calculatedHash = '0x' + hashLog(log).toString('hex');
    console.log("Calculated hash:", calculatedHash);
    
    // Compare the hashes to see if they match
    const hashesMatch = (calculatedHash.toLowerCase() === proof.hash.toLowerCase());
    console.log("Hashes match:", hashesMatch);
    
    // If hashes don't match, verification will fail
    if (!hashesMatch) {
      console.log("Hash mismatch - log may have been tampered with or is not the exact same as stored");
      return {
        verified: false,
        reason: 'LOG_HASH_MISMATCH',
        details: {
          calculatedHash,
          storedHash: proof.hash
        }
      };
    }
    
    // Root validation - make sure we don't have a truncated or corrupted root value
    if (!root || root.length < 66) {  // 0x + 64 hex chars
      console.error(`Invalid merkle root format: "${root}"`);
      return {
        verified: false,
        reason: 'INVALID_MERKLE_ROOT',
        details: {
          rootLength: root ? root.length : 0,
          expectedMinLength: 66
        }
      };
    }
    
    // Create a tree for verification using the proven hash
    const tree = new MerkleTree([], keccak256, { sortPairs: true });
    
    // Verify the proof
    try {
      const verified = tree.verify(proof.proof, proof.hash, root);
      console.log("Merkle proof verification result:", verified);
      
      if (verified) {
        return {
          verified: true
        };
      } else {
        return {
          verified: false,
          reason: 'MERKLE_PROOF_INVALID',
          details: {
            merkleRoot: root
          }
        };
      }
    } catch (error) {
      console.error("Error during tree verification:", error);
      console.log("Root:", root);
      try {
        console.log("Proof:", JSON.stringify(proof.proof));
      } catch (e) {
        console.log("Proof: [Error stringifying proof]");
      }
      console.log("Hash:", proof.hash);
      
      return {
        verified: false,
        reason: 'VERIFICATION_ERROR',
        details: {
          error: error.message
        }
      };
    }
  } catch (error) {
    console.error("Error in verification process:", error);
    return {
      verified: false,
      reason: 'VERIFICATION_PROCESS_ERROR',
      details: {
        error: error.message
      }
    };
  }
}

module.exports = {
  hashLog,
  processBatch,
  verifyLog
};
