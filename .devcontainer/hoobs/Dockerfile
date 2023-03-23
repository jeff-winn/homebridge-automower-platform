# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.155.1/containers/typescript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version: 14, 12, 10
ARG VARIANT="16-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list -here>"

RUN wget -qO- https://dl.hoobs.org/stable | sudo bash -
RUN apt -y install hoobsd hoobs-cli hoobs-gui

RUN mkdir /opt/hoobs

RUN ln -s /opt/hoobs /var/lib/hoobs && \
    ln -s /opt/hoobs /hoobs

RUN su -s /bin/sh -c "sudo /usr/bin/hbs install -p 8080"
RUN su -s /bin/sh -c "sudo /usr/bin/hbs bridge create -b local -p 50826 -a bonjour"

RUN chown -R node:node /opt/hoobs && \
    chown -R node:node /var/lib/hoobs && \
    chown -R node:node /hoobs