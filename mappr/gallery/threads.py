import threading
from queue import Queue
from time import sleep
from PIL import Image


class ImageProcessorThread(threading.Thread):
	def __init__(self, *args, **kwargs):
		threading.Thread.__init__(self, *args, **kwargs)
		self.input_queue = Queue()

	def send(self, item):
		self.input_queue.put(item)

	def close(self):
		self.input_queue.put(None)
		self.input_queue.join()

	def run(self):
		while True:
			image_path = self.input_queue.get()
			if image_path is None:
				break

			# Process the image here
			im = Image.open(image_path)
			print(image_path, im.format, im.size, im.mode)

			# TODO: Save Webp copy
			# TODO: Maybe re-process as JPEG with higher compression
			# TODO: Figure out how to implement AVIF compression

			self.input_queue.task_done()
			sleep(1)

		# Done
		self.input_queue.task_done()
		return
