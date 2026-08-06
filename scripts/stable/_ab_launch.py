import os, sys
_here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _here)
import runpy
runpy.run_path(os.path.join(_here, "anima_train_network.py"), run_name="__main__")
