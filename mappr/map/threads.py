import csv
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

			fh = open(csv_file, 'r')
			try:
				dialect = csv.Sniffer().sniff(fh.read(1024))
				# Perform various checks on the dialect (e.g., lineseparator, delimiter) to make sure it's sane

				# Don't forget to reset the read position back to the start of the file before reading any entries.
				fh.seek(0)
			except csv.Error:
				return

			# Read file and import data into db

			self.input_queue.task_done()
			sleep(1)

		# Done
		self.input_queue.task_done()
		return
