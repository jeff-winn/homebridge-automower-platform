#!/bin/bash
if [ ! -f /etc/hoobs/bridges.conf ]; then
    /usr/bin/hbs install -p 8080
    /usr/bin/hbs bridge create -b local -p 50826 -a bonjour
fi