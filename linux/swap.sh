#!/bin/bash

Green="\033[32m"
Font="\033[0m"
Red="\033[31m"

# Check for root privileges
root_check() {
    if [[ $EUID -ne 0 ]]; then
        echo -e "${Red}Error: This script must be run as root!${Font}"
        exit 1
    fi
}

# Check for OpenVZ
check_ovz() {
    if [[ -d "/proc/vz" ]]; then
        echo -e "${Red}Your VPS is based on OpenVZ, which is not supported!${Font}"
        exit 1
    fi
}

add_swap() {
    echo -e "${Green}Please enter the size of swap you want to add (recommended to be 2x your RAM)!${Font}"
    read -p "Enter swap size in megabytes: " swapsize

    # Check if swapfile already exists
    grep -q "swapfile" /etc/fstab

    # If it doesn't exist, create swap
    if [ $? -ne 0 ]; then
        echo -e "${Green}Swapfile not found, creating a swapfile.${Font}"
        fallocate -l ${swapsize}M /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap defaults 0 0' >> /etc/fstab
        echo -e "${Green}Swap created successfully. Here are some informations:${Font}"
        cat /proc/swaps
        cat /proc/meminfo | grep Swap
    else
        echo -e "${Red}Swapfile already exists. Swap setting failed. Please remove the existing swapfile and try again.${Font}"
    fi
}

remove_swap() {
    # Check if swapfile exists
    grep -q "swapfile" /etc/fstab

    # If it exists, remove it
    if [ $? -eq 0 ]; then
        echo -e "${Green}Swapfile found, removing it.${Font}"
        sed -i '/swapfile/d' /etc/fstab
        echo "3" > /proc/sys/vm/drop_caches
        swapoff -a
        rm -f /swapfile
        echo -e "${Green}Swap removed!${Font}"
    else
        echo -e "${Red}Swapfile not found. Swap removal failed!${Font}"
    fi
}

# Main menu
main() {
    root_check
    check_ovz
    clear
    echo -e "--------------------------------------------------"
    echo -e "${Green}Linux VPS Swap Management Script${Font}"
    echo -e "${Green}1. Add Swap${Font}"
    echo -e "${Green}2. Remove Swap${Font}"
    echo -e "--------------------------------------------------"
    read -p "Enter a number [1-2]: " num
    case "$num" in
        1)
            add_swap
            ;;
        2)
            remove_swap
            ;;
        *)
            clear
            echo -e "${Green}Please enter a valid number [1-2]${Font}"
            sleep 2s
            main
            ;;
    esac
}

main
