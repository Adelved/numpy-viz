# numpy-viz

A simple web-based tool for visualizing synthetic seismic generated in python and stored in the .npy format, which can be found [here](https://adelved.github.io/numpy-viz/).
The application loads with a synthetic demo cube, which was used in the training of the [FaultSeg3D](https://github.com/xinwucwp/faultSeg), implemented by Xinming Wu. 

![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")

## Limitations of current state:
1. Only support for rank 3 np.arrays with dimensions nxnxn
2. The data type of the input must be float32 (np.single) 
3. Only supports the .npy format. Other binary file formats must first be converted to .npy. 
4. Fault visualization not yet implemented. 

