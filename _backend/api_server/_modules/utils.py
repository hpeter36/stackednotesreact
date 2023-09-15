from random import choice
import string
import argparse

def get_random_string(length):
    return ''.join([choice(string.ascii_letters + string.digits) for i in range(length)])
    
def str2bool(v):
    if isinstance(v, bool):
       return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')