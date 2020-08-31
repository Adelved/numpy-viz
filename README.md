# numpy-viz

A simple web-based tool for visualizing synthetic seismic generated in python and stored in the .npy format, which can be found [here](https://adelved.github.io/numpy-viz/).

![alt_text](https://github.com/Adelved/numpy-viz/blob/master/resources/headerim.PNG)

The application loads with a synthetic demo cube, which was used in the training of the fault detection model [FaultSeg3D](https://github.com/xinwucwp/faultSeg), implemented by Xinming Wu. 

## Limitations of current state:
1. Only support for rank 3 np.arrays with dimensions nxnxn (e.g. an 128x128x128 numpy array)
2. To ensure that the data is correctly displayed, the z-slice must be stored as the last element in the np 3D array. ([x,y,z])
3. The data type of the input must be float32 (np.single) 
4. Only supports the .npy format. Other binary file formats must first be converted to .npy. 
5. Fault visualization not yet implemented. 

