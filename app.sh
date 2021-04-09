#!/bin/bash

ARGS="$ARGS --workers 3 --bind unix:mappr.sock -m 007"

exec venv/bin/gunicorn $ARGS wsgi:app
