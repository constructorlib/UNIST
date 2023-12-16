#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>  // Added for htons

#include <ev.h>

#define PORT 8080

struct ev_io server_watcher;
struct ev_loop *loop;

static void server_cb(struct ev_loop *main_loop, struct ev_io *watcher, int revents) {
    if (EV_ERROR & revents) {
        perror("got invalid event");
        return;
    }

    if (EV_READ & revents) {
        int new_socket = accept(watcher->fd, NULL, NULL);
        if (new_socket < 0) {
            perror("accept");
            return;
        }

        char buffer[1024] = {0};
        ssize_t r = recv(new_socket, buffer, sizeof(buffer), 0);
        if (r < 0) {
            perror("read");
        } else if (r == 0) {
            printf("Client disconnected\n");
        } else {
            printf("%s\n", buffer);
            send(new_socket, "Hello from server", 17, 0);
            printf("Hello message sent\n");
        }

        close(new_socket);
    }
}

int main() {
    loop = EV_DEFAULT;

    int server_fd;
    struct sockaddr_in address;
    int opt = 1;

    // Creating socket file descriptor
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    // Forcefully attaching socket to the port 8080
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt, sizeof(opt))) {
        perror("setsockopt");
        exit(EXIT_FAILURE);
    }

    memset(&address, 0, sizeof(address));  // Initialize address structure
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    // Forcefully attaching socket to the port 8080
    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 3) < 0) {
        perror("listen");
        exit(EXIT_FAILURE);
    }

    ev_io_init(&server_watcher, server_cb, server_fd, EV_READ);
    ev_io_start(loop, &server_watcher);

    ev_run(loop, 0);

    return 0;
}
