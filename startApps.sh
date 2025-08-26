#!/bin/bash

tmux split-window -h "export NODE_ENV=development && export DB_URL=http://localhost:8000 && cd api && npm run dev"
tmux split-window -h "cd client && npm run dev"
tmux select-pane -t 0
tmux select-layout even-horizontal
tmux send-keys "clear" C-m
tmux send-keys "cd database && npm run dev" C-m
