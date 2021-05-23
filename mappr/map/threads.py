import threading
from queue import Queue
from time import sleep


class FileProcessorThread(threading.Thread):
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
			csv_file = self.input_queue.get()
			if csv_file is None:
				break

			# Read file and import data into db

			self.input_queue.task_done()
			sleep(1)

		# Done
		self.input_queue.task_done()
		return
