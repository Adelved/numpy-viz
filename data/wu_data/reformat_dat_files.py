import numpy as np
import os

seis = np.fromfile(r'195.dat',dtype=np.single)
seis = seis.reshape(128,128,128)
np.save(r'reformatted_195.npy',seis)