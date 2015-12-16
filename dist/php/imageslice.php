<?php
/*
	name: imageSlice
	by: Maurice van Creij
	version: 20140603
	source: http://www.jooney.co.uk/
	description: A simple PHP webservice to slice and scale photos.
	example: imageslice.php?src={src}&left={left}&top={top}&right={right}&bottom={bottom}&width={width}&height={height}
*/

	class imageSlice
	{
		var $myImage, $cropLeft, $cropTop, $cropWidth, $cropHeight, $imageWidth, $imageHeight, $slice;

		function getImage($imageSrc, $cropLeft, $cropTop, $cropRight, $cropBottom)
		{
			// default values
			if($cropLeft == '') $cropLeft = 0;
			if($cropTop == '') $cropTop = 0;
			if($cropRight == '') $cropRight = 1;
			if($cropBottom == '') $cropBottom = 1;

			// get the image dimensions
			list($imageWidth, $imageHeight) = getimagesize($imageSrc);
			$this->imageWidth = $imageWidth;
			$this->imageHeight = $imageHeight;

			// create image from the jpeg
			$this->myImage = imagecreatefromjpeg($imageSrc) or die("Error: Cannot find image!");

			// get a pixel value for the position of the crop
			$this->cropLeft = $imageWidth * $cropLeft;
			$this->cropTop = $imageHeight * $cropTop;

			// get a pixel value for the dimensions of the crop
			$this->cropWidth = $imageWidth * ($cropRight - $cropLeft);
			$this->cropHeight = $imageHeight * ($cropBottom - $cropTop);
		}

		function createSlice($sliceWidth, $sliceHeight)
		{

			// compensate for missing dimensions
			if (!isset($sliceWidth) || $sliceWidth == '' || $sliceWidth == 0) $sliceWidth = $this->cropWidth / $this->cropHeight * $sliceHeight;
			if (!isset($sliceHeight) || $sliceHeight == '' || $sliceHeight == 0) $sliceHeight = $this->cropHeight / $this->cropWidth * $sliceWidth;

			// create a canvas for the slice
			$this->slice = imagecreatetruecolor($sliceWidth, $sliceHeight);

			// crop and scale the image
			imagecopyresampled(
				$this->slice,
				$this->myImage,
				0,
				0,
				round($this->cropLeft),
				round($this->cropTop),
				round($sliceWidth),
				round($sliceHeight),
				round($this->cropWidth),
				round($this->cropHeight)
			);
		}

		function renderImage()
		{
			header('Content-type: image/jpeg');
			imagejpeg($this->slice);
			imagedestroy($this->slice);
		}

	}

	$image = new imageSlice;
	$image->getImage(@$_REQUEST['src'], @$_REQUEST['left'], @$_REQUEST['top'], @$_REQUEST['right'], @$_REQUEST['bottom']);
	$image->createSlice(@$_REQUEST['width'], @$_REQUEST['height']);
	$image->renderImage();

?>
