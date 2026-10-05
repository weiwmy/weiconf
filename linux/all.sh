#!/bin/bash

# Configuration
GITHUB_REPO="https://github.com/weiwmy/weiconf"
HELP_URL="https://github.com/weiwmy"

# Colors
color() { echo -e "\033[$1m\033[01m$2\033[0m"; }
red() { color 31 "$1"; }
green() { color 32 "$1"; }
yellow() { color 33 "$1"; }
blue() { color 34 "$1"; }

press_any_key() { read -n 1 -s -r -p "Press any key to continue..."; echo; }

# Check root
[ "$(id -u)" -ne 0 ] && { red "Please run as root."; exit 1; }

# Package management
install_package() {
    local pkg="$1" cmd="${2:-$1}"
    command -v "$cmd" &>/dev/null && { yellow "$pkg already installed."; return 0; }
    yellow "Installing $pkg..."
    if command -v apt-get &>/dev/null; then
        apt-get update && apt-get install -y "$pkg"
    elif command -v dnf &>/dev/null; then
        dnf install -y "$pkg"
    elif command -v yum &>/dev/null; then
        yum install -y "$pkg"
    else
        red "Unsupported package manager. Install $pkg manually."; return 1
    fi
    green "$pkg installed successfully."
}

uninstall_package() {
    local pkg="$1" cmd="${2:-$1}"
    ! command -v "$cmd" &>/dev/null && { yellow "$pkg not installed."; return 0; }
    yellow "Uninstalling $pkg..."
    if command -v apt-get &>/dev/null; then
        apt-get remove -y "$pkg"
    elif command -v dnf &>/dev/null; then
        dnf remove -y "$pkg"
    elif command -v yum &>/dev/null; then
        yum remove -y "$pkg"
    else
        red "Unsupported package manager. Remove $pkg manually."; return 1
    fi
    green "$pkg uninstalled successfully."
}

# Main menu loop
while true; do
    clear
    red " WEICONF"
    green " FROM: $GITHUB_REPO"
    green " HELP: $HELP_URL"
    yellow " =================================================="
    green " 1. Run System Benchmark"
    green " 2. Docker Management"
    green " 3. Enable BBR FQ"
    green " 4. Update SWAP"
    green " 5. Change Port"
    green " 6. Check Media"
    yellow " =================================================="
    green " 0. Exit"
    read -p "Enter a number: " choice

    case "$choice" in
        1) wget -qO- bench.sh | bash; green "Bench Completed!"; press_any_key ;;
        2)
            while true; do
                clear
                green " Docker Management"
                yellow " =================================================="
                green " 1. Install dockge"
                green " 2. Install Docker (with Compose plugin)"
                green " 3. Uninstall Docker (with Compose plugin)"
                yellow " =================================================="
                green " 0. Back"
                read -p "Enter a number: " d
                case "$d" in
                    1) mkdir -p /opt/stacks /opt/dockge && cd /opt/dockge && curl -sS -O https://cf.weiwmy.net/docker/dockge/compose.yaml && docker compose up -d; press_any_key ;;
                    2) install_package "docker.io" "docker"; press_any_key ;;
                    3) uninstall_package "docker.io" "docker"; press_any_key ;;
                    0) break ;;
                    *) red "Invalid choice"; press_any_key ;;
                esac
            done
            ;;
        3)
            if grep -q "net.ipv4.tcp_congestion_control=bbr" /etc/sysctl.conf; then
                yellow "BBR already configured."
            else
                echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
                echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
                sysctl -p
                green "BBR Enabled."
            fi
            press_any_key
            ;;
        4)
            wget -O swap_update.sh https://cf.weiwmy.net/linux/swap.sh
            chmod +x swap_update.sh && ./swap_update.sh
            rm -f swap_update.sh
            press_any_key
            ;;
        5)
            read -p "Enter new SSH port (1-65535): " port
            if [[ "$port" =~ ^[0-9]+$ ]] && [ "$port" -ge 1 ] && [ "$port" -le 65535 ]; then
                sed -i -E "s/^#?Port [0-9]+/Port $port/" /etc/ssh/sshd_config
                systemctl restart sshd 2>/dev/null || service sshd restart 2>/dev/null
                green "SSH port changed to $port"
            else
                red "Invalid port"
            fi
            press_any_key
            ;;
        6)
            bash <(curl -L -s check.unlock.media)
            green "Media Unlock Completed!"
            press_any_key
            ;;
        0) exit 0 ;;
        *) red "Invalid choice"; press_any_key ;;
    esac
done
