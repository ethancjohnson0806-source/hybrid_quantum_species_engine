#!/usr/bin/env python3
"""
Quantum Engine Service Wrapper
Exposes the Legitimate Quantum Engine as an HTTP API for Node.js integration
"""

import json
import sys
import os
from typing import Dict, Any, List
from datetime import datetime
import traceback

# Add quantum engine to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from quantum_engine.quantum_engine_v5_unified import QuantumEngineV5
    from quantum_engine.quantum_problem_solvers import VQE, QAOA, GroverSearch
except ImportError as e:
    print(f"Error importing quantum engine: {e}", file=sys.stderr)
    sys.exit(1)


class QuantumServiceWrapper:
    """Wrapper to provide quantum engine functionality via JSON RPC"""
    
    def __init__(self):
        self.engines = {}  # Cache of engines by qubit count
        self.run_history = []
        
    def create_engine(self, num_qubits: int, use_gpu: bool = False) -> str:
        """Create a new quantum engine instance"""
        try:
            key = f"engine_{num_qubits}q_{'gpu' if use_gpu else 'cpu'}"
            if key not in self.engines:
                self.engines[key] = QuantumEngineV5(num_qubits=num_qubits, use_gpu=use_gpu)
            return key
        except Exception as e:
            raise Exception(f"Failed to create engine: {str(e)}")
    
    def run_vqe(self, num_qubits: int, iterations: int = 50) -> Dict[str, Any]:
        """Run VQE algorithm"""
        try:
            engine_key = self.create_engine(num_qubits)
            engine = self.engines[engine_key]
            
            # Create a random Hamiltonian
            import numpy as np
            H = np.diag(np.random.randn(2**num_qubits))
            H = (H + H.T) / 2
            
            start_time = datetime.now()
            result = engine.run_vqe(H, iterations=iterations)
            end_time = datetime.now()
            
            run_data = {
                'algorithm': 'VQE',
                'num_qubits': num_qubits,
                'iterations': iterations,
                'optimal_energy': float(result.get('optimal_energy', 0)),
                'convergence_history': result.get('convergence_history', []),
                'execution_time': (end_time - start_time).total_seconds(),
                'timestamp': start_time.isoformat(),
                'status': 'completed'
            }
            
            self.run_history.append(run_data)
            return run_data
            
        except Exception as e:
            return {
                'error': str(e),
                'traceback': traceback.format_exc(),
                'status': 'failed'
            }
    
    def run_qaoa(self, num_qubits: int, iterations: int = 50) -> Dict[str, Any]:
        """Run QAOA algorithm"""
        try:
            engine_key = self.create_engine(num_qubits)
            engine = self.engines[engine_key]
            
            # Create a random cost Hamiltonian
            import numpy as np
            H = np.diag(np.random.randn(2**num_qubits))
            H = (H + H.T) / 2
            
            start_time = datetime.now()
            result = engine.run_qaoa(H, iterations=iterations)
            end_time = datetime.now()
            
            run_data = {
                'algorithm': 'QAOA',
                'num_qubits': num_qubits,
                'iterations': iterations,
                'optimal_cost': float(result.get('optimal_cost', 0)),
                'convergence_history': result.get('convergence_history', []),
                'execution_time': (end_time - start_time).total_seconds(),
                'timestamp': start_time.isoformat(),
                'status': 'completed'
            }
            
            self.run_history.append(run_data)
            return run_data
            
        except Exception as e:
            return {
                'error': str(e),
                'traceback': traceback.format_exc(),
                'status': 'failed'
            }
    
    def run_grover(self, num_qubits: int, marked_indices: List[int]) -> Dict[str, Any]:
        """Run Grover's search algorithm"""
        try:
            engine_key = self.create_engine(num_qubits)
            engine = self.engines[engine_key]
            
            start_time = datetime.now()
            result = engine.run_grover_search(marked_indices)
            end_time = datetime.now()
            
            run_data = {
                'algorithm': 'Grover',
                'num_qubits': num_qubits,
                'marked_indices': marked_indices,
                'success_probability': float(result.get('total_marked_probability', 0)),
                'execution_time': (end_time - start_time).total_seconds(),
                'timestamp': start_time.isoformat(),
                'status': 'completed'
            }
            
            self.run_history.append(run_data)
            return run_data
            
        except Exception as e:
            return {
                'error': str(e),
                'traceback': traceback.format_exc(),
                'status': 'failed'
            }
    
    def get_run_history(self) -> List[Dict[str, Any]]:
        """Get history of all runs"""
        return self.run_history
    
    def process_command(self, command: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """Process a command from Node.js"""
        try:
            if command == 'run_vqe':
                return self.run_vqe(
                    num_qubits=args.get('num_qubits', 4),
                    iterations=args.get('iterations', 50)
                )
            elif command == 'run_qaoa':
                return self.run_qaoa(
                    num_qubits=args.get('num_qubits', 4),
                    iterations=args.get('iterations', 50)
                )
            elif command == 'run_grover':
                return self.run_grover(
                    num_qubits=args.get('num_qubits', 4),
                    marked_indices=args.get('marked_indices', [1, 3])
                )
            elif command == 'get_history':
                return {'runs': self.get_run_history()}
            else:
                return {'error': f'Unknown command: {command}'}
        except Exception as e:
            return {
                'error': str(e),
                'traceback': traceback.format_exc()
            }


# Global service instance
service = QuantumServiceWrapper()


def main():
    """Main entry point for command-line usage"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No command provided'}))
        sys.exit(1)
    
    command = sys.argv[1]
    args = {}
    
    # Parse additional arguments as JSON
    if len(sys.argv) > 2:
        try:
            args = json.loads(sys.argv[2])
        except json.JSONDecodeError:
            pass
    
    result = service.process_command(command, args)
    print(json.dumps(result, default=str))


if __name__ == '__main__':
    main()
