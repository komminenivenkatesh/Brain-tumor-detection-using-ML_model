"""3D Brain Visualization Module"""
import numpy as np
import json
from typing import List, Dict
import plotly.graph_objects as go
from plotly.io import to_json


def create_3d_brain_model(mri_slices: np.ndarray, tumor_mask: np.ndarray) -> Dict:
    """
    Convert MRI slices into 3D model with tumor highlighting
    
    Args:
        mri_slices: 3D numpy array of MRI images (depth, height, width)
        tumor_mask: 3D numpy array indicating tumor locations
        
    Returns:
        Dictionary containing 3D visualization data
    """
    try:
        # Normalize MRI data for visualization
        mri_normalized = (mri_slices - mri_slices.min()) / (mri_slices.max() - mri_slices.min() + 1e-8)
        
        # Create voxel coordinates
        x, y, z = np.indices(mri_normalized.shape)
        
        # Brain tissue (non-zero MRI values)
        brain_mask = mri_normalized > 0.1
        
        # Separate tumor and normal brain tissue
        tumor_voxels = tumor_mask > 0.5
        normal_brain_voxels = brain_mask & ~tumor_voxels
        
        # Extract coordinates for normal brain tissue
        normal_x = x[normal_brain_voxels]
        normal_y = y[normal_brain_voxels]
        normal_z = z[normal_brain_voxels]
        normal_intensity = mri_normalized[normal_brain_voxels]
        
        # Extract coordinates for tumor
        tumor_x = x[tumor_voxels]
        tumor_y = y[tumor_voxels]
        tumor_z = z[tumor_voxels]
        
        # Create 3D scatter plot
        fig = go.Figure()
        
        # Add normal brain tissue
        fig.add_trace(go.Scatter3d(
            x=normal_x,
            y=normal_y,
            z=normal_z,
            mode='markers',
            marker=dict(
                size=2,
                color=normal_intensity,
                colorscale='Blues',
                opacity=0.3,
                showscale=False
            ),
            name='Brain Tissue',
            hovertemplate='<b>Brain Tissue</b><br>X: %{x}<br>Y: %{y}<br>Z: %{z}<extra></extra>'
        ))
        
        # Add tumor highlighting
        if len(tumor_x) > 0:
            fig.add_trace(go.Scatter3d(
                x=tumor_x,
                y=tumor_y,
                z=tumor_z,
                mode='markers',
                marker=dict(
                    size=3,
                    color='red',
                    opacity=0.8,
                    symbol='diamond'
                ),
                name='Tumor Region',
                hovertemplate='<b>Tumor</b><br>X: %{x}<br>Y: %{y}<br>Z: %{z}<extra></extra>'
            ))
        
        # Update layout
        fig.update_layout(
            title='3D Brain MRI Visualization with Tumor Highlighting',
            scene=dict(
                xaxis_title='X Axis',
                yaxis_title='Y Axis',
                zaxis_title='Z Axis (Slices)',
                camera=dict(
                    eye=dict(x=1.5, y=1.5, z=1.3)
                )
            ),
            width=900,
            height=800,
            hovermode='closest'
        )
        
        return {
            'success': True,
            'visualization': to_json(fig),
            'tumor_volume': int(np.sum(tumor_voxels)),
            'brain_volume': int(np.sum(brain_mask)),
            'tumor_percentage': float(np.sum(tumor_voxels) / (np.sum(brain_mask) + 1e-8) * 100)
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def generate_axial_slices(mri_slices: np.ndarray, tumor_mask: np.ndarray, num_slices: int = 5) -> Dict:
    """
    Generate key axial slices with tumor overlay
    """
    try:
        depth = mri_slices.shape[0]
        slice_indices = np.linspace(0, depth - 1, num_slices, dtype=int)
        
        slices_data = []
        for idx in slice_indices:
            slice_img = mri_slices[idx]
            slice_tumor = tumor_mask[idx]
            
            slices_data.append({
                'index': int(idx),
                'image': slice_img.tolist(),
                'tumor_mask': slice_tumor.tolist(),
                'has_tumor': bool(np.sum(slice_tumor) > 0)
            })
        
        return {
            'success': True,
            'slices': slices_data,
            'total_slices': int(depth)
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
