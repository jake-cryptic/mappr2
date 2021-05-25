import csv
import threading
from queue import Queue
from time import sleep
from .. import mongo, db


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
			reference, csv_file = self.input_queue.get()
			if csv_file is None:
				break

			try:
				with open(csv_file, newline='') as fh:
					dialect = csv.Sniffer().sniff(fh.read(1024))
					print(dialect)
					# Don't forget to reset the read position back to the start of the file before reading any entries.
					fh.seek(0)

					reader = csv.DictReader(fh)
					print(reader.fieldnames)
					for row in reader:
						print(row)

			except csv.Error:
				return

			# Read file and import data into db

			self.input_queue.task_done()
			sleep(1)

		# Done
		self.input_queue.task_done()
		return
