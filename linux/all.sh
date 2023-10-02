#!/bin/bash

# Configuration
GITHUB_REPO="https://github.com/weiwmy/congfig"
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

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
  red "Please run this script as root or with sudo."
  exit 1
fi

# Function to display the main menu
function start_menu() {
  clear
  red " My Script"
  green " FROM: $GITHUB_REPO"
  green " HELP: $HELP_URL"
  green " USE:  wget -O all.sh $GITHUB_REPO/main/linux/all.sh && chmod +x all.sh && clear && ./all.sh"
  yellow " =================================================="
  green " 1. Docker"
  green " 2. Docker Compose"
  green " 3. Enable BBR FQ"
  green " 4. Update SWAP "
  green " 5. Run Bench Test"
  green " 6. Change SSH Port"
  green " 7. Stream Media Unlock"
  yellow " =================================================="
  green " 0. Exit"
  echo
  read -p "Enter a number:" menuNumberInput
  case "$menuNumberInput" in
    1)
      docker_menu
      ;;
    2)
      docker_compose_menu
      ;;
    3)
      enable_bbr_fq
      ;;
    4)
      # Replace the update_swap function with the script from the URL
      wget -O swap_update.sh https://raw.githubusercontent.com/weiwmy/config/main/linux/swap.sh
      chmod +x swap_update.sh
      ./swap_update.sh
      ;;
    5)
      run_benchmark_test
      ;;
    6)
      change_ssh_port
      ;;
    7)
      stream_media_unlock
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

# Function to handle Docker installation and uninstallation
function docker_menu() {
  clear
  green " Docker Installation and Uninstallation"
  yellow " =================================================="
  green " 1. Install Docker"
  green " 2. Uninstall Docker"
  yellow " =================================================="
  green " 0. Back to Main Menu"
  echo
  read -p "Enter a number:" dockerMenuInput
  case "$dockerMenuInput" in
    1)
      install_docker
      ;;
    2)
      uninstall_docker
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

# Function to install Docker
function install_docker() {
  if ! command -v docker &>/dev/null; then
    if [ -x "$(command -v apt)" ]; then
      apt update
      apt install -y docker.io
    elif [ -x "$(command -v yum)" ]; then
      yum install -y docker
    else
      red "Unsupported package manager. Please install Docker manually."
    fi
    green "Docker Installed Successfully!"
  else
    yellow "Docker is already installed."
  fi
}

# Function to uninstall Docker
function uninstall_docker() {
  if command -v docker &>/dev/null; then
    if [ -x "$(command -v apt)" ]; then
      apt remove -y docker.io
    elif [ -x "$(command -v yum)" ]; then
      yum remove -y docker
    else
      red "Unsupported package manager. Please uninstall Docker manually."
    fi
    green "Docker Uninstalled Successfully!"
  else
    yellow "Docker is not installed."
  fi
}

# Function to handle Docker Compose installation and uninstallation
function docker_compose_menu() {
  clear
  green " Docker Compose Installation and Uninstallation"
  yellow " =================================================="
  green " 1. Install Docker Compose"
  green " 2. Uninstall Docker Compose"
  yellow " =================================================="
  green " 0. Back to Main Menu"
  echo
  read -p "Enter a number:" composeMenuInput
  case "$composeMenuInput" in
    1)
      install_docker_compose
      ;;
    2)
      uninstall_docker_compose
      ;;
    0)
      start_menu
      ;;
    *)
      clear
      red "Please enter a valid number!"
      docker_compose_menu
      ;;
  esac
}

# Function to install Docker Compose
function install_docker_compose() {
  if ! command -v docker-compose &>/dev/null; then
    if [ -x "$(command -v apt)" ]; then
      apt update
      apt install -y docker-compose
    elif [ -x "$(command -v yum)" ]; then
      yum install -y docker-compose
    else
      red "Unsupported package manager. Please install Docker Compose manually."
    fi
    green "Docker Compose Installed Successfully!"
  else
    yellow "Docker Compose is already installed."
  fi
}

# Function to uninstall Docker Compose
function uninstall_docker_compose() {
  if command -v docker-compose &>/dev/null; then
    if [ -x "$(command -v apt)" ]; then
      apt remove -y docker-compose
    elif [ -x "$(command -v yum)" ]; then
      yum remove -y docker-compose
    else
      red "Unsupported package manager. Please uninstall Docker Compose manually."
    fi
    green "Docker Compose Uninstalled Successfully!"
  else
    yellow "Docker Compose is not installed."
  fi
}

# Function to enable BBR FQ algorithm
function enable_bbr_fq() {
  if ! grep -q "tcp_bbr" /etc/modules-load.d/modules.conf; then
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p
    sysctl net.ipv4.tcp_available_congestion_control
    lsmod | grep bbr
    green "BBR FQ Algorithm Enabled Successfully!"
  else
    yellow "BBR FQ Algorithm is already enabled."
  fi
}

# Function to run benchmark test
function run_benchmark_test() {
  wget -qO- git.io/superbench.sh | bash
  green "Bench Test Completed!"
}

# Function to change SSH Port
function change_ssh_port() {
  read -p "Enter the new SSH port: " new_port
  if [[ "$new_port" =~ ^[0-9]+$ ]]; then
    sed -i "s/Port [0-9]\+/Port $new_port/g" /etc/ssh/sshd_config
    systemctl restart sshd
    green "SSH port changed to $new_port"
  else
    red "Invalid port number. Please enter a valid number."
  fi
}

# Function to stream media unlock
function stream_media_unlock() {
  # Execute the script from the provided source
  bash <(curl -L -s https://raw.githubusercontent.com/lmc999/RegionRestrictionCheck/main/check.sh)
  green "Stream Media Unlock Completed!"
}

# Start the main menu
start_menu
