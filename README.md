# Slurm80
Slurm web app listening on 80

## Install

### Clone

`git clone --recurse-submodules git@github.com:hugodecasta/slurm80.git`

### Data setup

Create a `DATA` file containing the following informations

```properties
name=<your cluster name>
logo=<path/to/your/logo.png>
gmethod=file | sinfo
filename=<path/to/info/file.json>
interval=5
```

 - the `gmethod` data indicates the way the system will retrieve the sinfo data.
    * *file* > retrieve from a file located in the *filename* data path
    * *sinfo* > automaticaly executes the `sinfo --json` command
 - The `filename` data is needed only in the case of `gmethod=file`
 - The `interval` data indicates the time (in seconds) beetween 2 front updates


## Starting

The slurm80 server is a simple php server that can be serviced using a simple php command like

`php -S 127.0.0.1:8080`

To serve the server on *localhost* listening on port *8080*

It is recommand to setup a service launching the php command and an apache/nginx proxy like system to serve the server through a designated port

https://httpd.apache.org/docs/2.4/vhosts/examples.html
https://www.paralleldevs.com/blog/creating-virtual-host-nginx-step-step-guide/