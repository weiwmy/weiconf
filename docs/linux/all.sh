#!/bin/bash

# Configuration
GITHUB_REPO="https://github.com/weiwmy/weiconf"
HELP_URL="https://github.com/weiwmy"

# Color functions
red() {
  echo -e "\033[31m\033[01m$1\033[0m"
}
green() {
  echo -e "\033[32m\033[01m$1\033[0m"
}
yellow() {
  echo -e "\033[33m\033[01m$1\033[0m"
}
blue() {
  echo -e "\033[34m\033[01m$1\033[0m"
}

function press_any_key() {
  echo
  read -n 1 -s -r -p "Press any key to continue..."
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
  red "Please run this script as root or with sudo."
  exit 1
fi

# Function to display the main menu
function start_menu() {
  clear
  red " WEICONF"
  green " FROM: $GITHUB_REPO"
  green " HELP: $HELP_URL"
  green " USE:  curl -sS -O https://cf.weiwmy.net/linux/all.sh && chmod +x all.sh && ./all.sh"
  yellow " =================================================="
  green " 1. Run System Benchmark"
  green " 2. Docker Management"
  green " 3. Enable BBR FQ "
  green " 4. Update SWAP "
  green " 5. Change Port "
  green " 6. Check Media "
  yellow " =================================================="
  green " 0. Exit"
  echo
  read -p "Enter a number:" choice
  case "$choice" in
    1)
      run_benchmark
      press_any_key
      ;;
    2)
      docker_menu
      ;;
    3)
      enable_bbr_fq
      press_any_key
      ;;
    4)
      update_swap
      press_any_key
      ;;
    5)
      change_port
      press_any_key
      ;;
    6)
      stream_media
      press_any_key
      ;;
    0)
      exit 0
      ;;
    *)
      clear
      red "Please enter a valid number!"
      start_menu
      ;;
  esac
}

function run_benchmark() {
    wget -qO- bench.sh | bash
    green "Bench Test Completed!"
}


# Function to handle Docker Compose 
function docker_menu() {
  clear
  green " Docker Management"
  yellow " =================================================="
  green " 1. Install dockge "
  green " 2. Install Docker (with Compose plugin)"
  green " 3. Uninstall Docker (with Compose plugin)"
  yellow " =================================================="
  green " 0. Back to Main Menu"
  echo
  read -p "Enter a number:" choice
  case "$choice" in
    1)
      install_dockge
      press_any_key
      ;;
    2)
      install_docker
      press_any_key
      ;;
    3)
      uninstall_docker
      press_any_key
      ;;
    0)
      start_menu
      ;;
    *)
      clear
      red "Please enter a valid number!"
      docker_menu
      ;;
  esac
}

# Function to install dockge
function install_dockge() {
  (
    mkdir -p /opt/stacks /opt/dockge && \
    cd /opt/dockge && \
    curl -sS https://cf.weiwmy.net/docker/dockge/compose.yaml --output compose.yaml && \
    docker compose up -d
  )
 } 

# --- Refactored Package Management Functions ---

function _install_package() {
  local pkg_name=$1
  local cmd_name=${2:-$1}
  if ! command -v "$cmd_name" &> /dev/null; then
    yellow "Installing $pkg_name..."
    if [ -x "$(command -v apt-get)" ]; then
      apt-get update && apt-get install -y "$pkg_name"
    elif [ -x "$(command -v dnf)" ]; then
      dnf install -y "$pkg_name"
    elif [ -x "$(command -v yum)" ]; then
      yum install -y "$pkg_name"
    else
      red "Unsupported package manager. Please install $pkg_name manually."
      return 1
    fi
    green "$pkg_name installed successfully!"
  else
    yellow "$pkg_name is already installed."
  fi
}

function _uninstall_package() {
  local pkg_name=$1
  local cmd_name=${2:-$1}
  if command -v "$cmd_name" &> /dev/null; then
    yellow "Uninstalling $pkg_name..."
    if [ -x "$(command -v apt-get)" ]; then
      apt-get remove -y "$pkg_name"
    elif [ -x "$(command -v dnf)" ]; then
      dnf remove -y "$pkg_name"
    elif [ -x "$(command -v yum)" ]; then
      yum remove -y "$pkg_name"
    else
      red "Unsupported package manager. Please uninstall $pkg_name manually."
      return 1
    fi
    green "$pkg_name uninstalled successfully!"
  else
    yellow "$pkg_name is not installed."
  fi
}

function install_docker() { _install_package "docker.io" "docker"; }
function uninstall_docker() { _uninstall_package "docker.io" "docker"; }

# Function to enable BBR FQ algorithm
function enable_bbr_fq() {
  if grep -q "net.ipv4.tcp_congestion_control=bbr" /etc/sysctl.conf; then
    yellow "BBR FQ Algorithm seems to be already configured."
  else
    green "Enabling BBR FQ Algorithm..."
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p
    green "BBR FQ Algorithm Enabled Successfully!"
    yellow "A reboot is recommended for the changes to take full effect."
  fi
  echo "Current congestion control: $(sysctl net.ipv4.tcp_congestion_control)"
  echo "Available congestion controls: $(sysctl net.ipv4.tcp_available_congestion_control)"
}

# Function to change SSH Port
function change_port() {
  read -p "Enter the new SSH port (1-65535): " new_port
  # Validate if input is a number and within the valid port range
  if [[ "$new_port" =~ ^[0-9]+$ && "$new_port" -ge 1 && "$new_port" -le 65535 ]]; then
    # Use a robust sed command to find and replace the port number.
    # It handles lines that are commented out (#Port 22) or active (Port 22).
    sed -i -E "s/^#?Port [0-9]+/Port $new_port/" /etc/ssh/sshd_config
    green "Restarting SSH service to apply the new port..."
    # Attempt to restart with systemctl, fall back to service for older systems
    if systemctl restart sshd; then
        green "SSH service restarted successfully."
    elif service sshd restart; then
        green "SSH service restarted successfully."
    else
        red "Failed to restart SSH service. Please do it manually."
    fi
    green "SSH port changed to $new_port"
  else
    red "Invalid input. Please enter a valid port number between 1 and 65535."
  fi
}

function update_swap() {
    wget -O swap_update.sh https://cf.weiwmy.net/linux/swap.sh
    chmod +x swap_update.sh
    ./swap_update.sh
    rm ./swap_update.sh
}

# Function to stream media unlock
function stream_media() {
  # Execute the script from the provided source
  bash <(curl -L -s check.unlock.media)
  green "Stream Media Unlock Completed!"
}

# Start the main menu
start_menu
