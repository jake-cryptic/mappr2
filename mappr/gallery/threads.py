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
			im_file = self.input_queue.get()
			if im_file is None:
				break

			# Process the image here
			try:
				with Image.open(im_file) as im:
					print(im_file, im.format, im.size, im.mode)
					im.save(im_file + '.jpg', 'JPEG', quality=70, progressive=True)
					im.save(im_file + '.webp', 'WEBP', lossless=False, method=6, quality=100)
			except OSError:
				print("Could not convert file", im_file)

			# TODO: Figure out how to implement AVIF compression

			self.input_queue.task_done()
			sleep(1)

		# Done
		self.input_queue.task_done()
		return
