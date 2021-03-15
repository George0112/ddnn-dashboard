const Const = {
  vgg16CuttablePoints: [
    {
      "index": 0, 
      "name": "don't cut"
    }, 
    {
      "index": 1, 
      "name": "block1_conv1"
    }, 
    {
      "index": 2, 
      "name": "block1_conv2"
    }, 
    {
      "index": 3, 
      "name": "block1_pool"
    }, 
    {
      "index": 4, 
      "name": "block2_conv1"
    }, 
    {
      "index": 5, 
      "name": "block2_conv2"
    }, 
    {
      "index": 6, 
      "name": "block2_pool"
    }, 
    {
      "index": 7, 
      "name": "block3_conv1"
    }, 
    {
      "index": 8, 
      "name": "block3_conv2"
    }, 
    {
      "index": 9, 
      "name": "block3_conv3"
    }, 
    {
      "index": 10, 
      "name": "block3_pool"
    }, 
    {
      "index": 11, 
      "name": "block4_conv1"
    }, 
    {
      "index": 12, 
      "name": "block4_conv2"
    }, 
    {
      "index": 13, 
      "name": "block4_conv3"
    }, 
    {
      "index": 14, 
      "name": "block4_pool"
    }, 
    {
      "index": 15, 
      "name": "block5_conv1"
    }, 
    {
      "index": 16, 
      "name": "block5_conv2"
    }, 
    {
      "index": 17, 
      "name": "block5_conv3"
    }, 
    {
      "index": 18, 
      "name": "block5_pool"
    }, 
    {
      "index": 19, 
      "name": "flatten"
    }, 
    {
      "index": 20, 
      "name": "fc1"
    }, 
    {
      "index": 21, 
      "name": "fc2"
    }
  ],
  vgg16OutputPoints: [-1],
  multitaskCuttablePoints: [
    {
      "index": 0, 
      "name": "Don't cut"
    }, 
    {
      "index": 1, 
      "name": "conv2d"
    }, 
    {
      "index": 2, 
      "name": "conv2d_1"
    }, 
    {
      "index": 3, 
      "name": "max_pooling2d"
    }, 
    {
      "index": 4, 
      "name": "conv2d_2"
    }, 
    {
      "index": 5, 
      "name": "conv2d_3"
    }, 
    {
      "index": 6, 
      "name": "max_pooling2d_1"
    }, 
    {
      "index": 7, 
      "name": "conv2d_4"
    }, 
    {
      "index": 8, 
      "name": "conv2d_5"
    }, 
    {
      "index": 9, 
      "name": "max_pooling2d_2"
    }, 
    {
      "index": 10, 
      "name": "conv2d_6"
    }, 
    {
      "index": 11, 
      "name": "conv2d_7"
    }, 
    {
      "index": 12, 
      "name": "conv2d_8"
    },
    {
      "index": 13, 
      "name": "max_pooling2d_2"
    }
  ],
  multitaskOutputPoints: [21, 22, 23]

}

export default Const;