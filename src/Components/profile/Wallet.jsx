import React, { useState, useEffect } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import useWalletStore from "../../Store/useWalletStore";
import useAuthStore from "../../Store/Auth";
import useBankStore from "../../Store/useBankStore";
import useGroupStore from "../../Store/group";
import { useLocation } from "react-router-dom";
import WalletOverview from "../profile/Wallet/WalletOverview";
import DepositWithdraw from "../profile/Wallet/DepositWithdraw";
import GroupTransfer from "../profile/Wallet/GroupTransfer";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  "pk_test_51R87iGPfjXlwgFldEuvXuheBeZSAsYvbFofgYtzi4U1lHweQoaBT7HyQjvPpwBmHjpptcLXf9BI48bG1NDknydyG00SdIOrc60"
);

const Wallet = ({ darkMode }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const {
    balance,
    currency = "USD",
    transactions = [],
    cards = [],
    loading: walletLoading,
    error: walletError,
    initializeWallet,
    getTransactions,
    deposit,
    withdraw,
    addCard,
    transferToGroup,
  } = useWalletStore();

  const {
    accounts = [],
    loading: bankLoading,
    error: bankError,
    getBankAccounts,
  } = useBankStore();

  const {
    groups = [],
    currentGroup,
    getUserGroups,
    getGroupDetails,
    loading: groupsLoading,
    error: groupsError,
  } = useGroupStore();

  const [balanceVisible, setBalanceVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCardModal, setShowCardModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    selectedAccount: "",
    groupTransferId: "",
  });
  const [amountError, setAmountError] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeWallet();
        await getTransactions();
        await getBankAccounts();
        await getUserGroups();
      } catch (error) {
        console.error("Failed to load wallet data:", error);
      }
    };

    if (user?._id) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (groups.length > 0 && !currentGroup && !selectedGroupId) {
      setSelectedGroupId(groups[0]?._id);
    }
  }, [groups, currentGroup, selectedGroupId]);

  useEffect(() => {
    if (selectedGroupId) {
      getGroupDetails(selectedGroupId);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (walletError) toast.error(walletError);
    if (bankError) toast.error(bankError);
    if (groupsError) toast.error(groupsError);
  }, [walletError, bankError, groupsError]);

  const getReturnUrl = () =>
    `${window.location.origin}${location.pathname}?payment=completed`;

  const resetForms = () => {
    setFormData({
      amount: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      name: "",
      selectedAccount: "",
      groupTransferId: "",
    });
    setShowCardModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount" && amountError) setAmountError("");

    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }

    if (name === "expiry" && value.length === 2 && !value.includes("/")) {
      setFormData((prev) => ({ ...prev, [name]: value + "/" }));
      return;
    }

    if (name === "groupTransferId") {
      setSelectedGroupId(value);
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAmount = () => {
    if (!formData.amount || Number(formData.amount) < 1) {
      setAmountError("Valid amount (minimum 1) is required");
      return false;
    }
    setAmountError("");
    return true;
  };

  const handleDeposit = async (paymentMethodId) => {
    try {
      if (!validateAmount()) return;

      await deposit({
        amount: formData.amount,
        paymentMethod: "card",
        token: { id: paymentMethodId },
        returnUrl: getReturnUrl(),
      });

      toast.success(`Deposit of ${formData.amount} ${currency} successful!`);
      resetForms();
    } catch (err) {
      toast.error(err.message || "Deposit failed");
    }
  };

  const handleGroupTransfer = async (e) => {
    e.preventDefault();
    try {
      if (!validateAmount()) return;
      if (!selectedGroupId) {
        toast.error("Please select a group");
        return;
      }

      if (!currentGroup) {
        toast.error("Group data not loaded");
        return;
      }

      const isMember = currentGroup?.members?.some(
        (member) => member?.user?._id === user?._id
      );
      if (!isMember) {
        toast.error("You are not a member of this group");
        return;
      }

      await transferToGroup({
        amount: formData.amount,
        groupId: currentGroup._id,
      });

      toast.success(`Transferred ${formData.amount} ${currency} to group!`);
      resetForms();
    } catch (err) {
      toast.error(err.message || "Transfer failed");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      if (!validateAmount()) return;
      if (!formData.selectedAccount) {
        toast.error("Please select a bank account");
        return;
      }

      await withdraw({
        amount: formData.amount,
        bankAccountId: formData.selectedAccount,
      });

      toast.success(
        `Withdrawal request for ${formData.amount} ${currency} submitted!`
      );
      resetForms();
    } catch (err) {
      toast.error(err.message || "Withdrawal failed");
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    try {
      await addCard({
        cardNumber: formData.cardNumber.replace(/\s/g, ""),
        expiry: formData.expiry,
        cvv: formData.cvv,
        name: formData.name,
      });
      toast.success("Card added successfully!");
      resetForms();
    } catch (err) {
      toast.error(err.message || "Failed to add card");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const isGroupMember = !!currentGroup?.members?.some(
    (member) => member?.user?._id === user?._id
  );

  return (
    <div
      className={`p-2 md:p-6 space-y-4 w-full ${
        darkMode ? "bg-gray-900" : "bg-white"
      } md:rounded-lg md:shadow-sm rounded-none shadow-none`}
    >
      <h2
        className={`text-2xl md:text-3xl font-bold ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Wallet
      </h2>

      <div className='flex overflow-x-auto pb-1 scrollbar-hide'>
        <div className='flex space-x-1 md:space-x-0 border-b w-full'>
          {["overview", "deposit", "withdraw", "transfer"].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-2 text-sm md:text-base md:px-4 md:py-2 font-medium whitespace-nowrap ${
                activeTab === tab
                  ? darkMode
                    ? "text-[#3390d5] border-b-2 border-blue-400"
                    : "text-[#3390d5] border-b-2 border-blue-600"
                  : darkMode
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-700"
              } transition-colors duration-200`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className='md:hidden flex justify-between items-center'>
        <span
          className={`font-medium ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Current Balance:
        </span>
        <button
          onClick={() => setBalanceVisible(!balanceVisible)}
          className={`px-3 py-1 rounded-md ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {balanceVisible ? (
            <span
              className={`font-semibold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {formatCurrency(balance)}
            </span>
          ) : (
            <span className='text-gray-500'>••••••</span>
          )}
        </button>
      </div>

      <div className='mt-4'>
        {activeTab === "overview" ? (
          <WalletOverview
            darkMode={darkMode}
            balance={balance}
            balanceVisible={balanceVisible}
            setBalanceVisible={setBalanceVisible}
            formatCurrency={formatCurrency}
            setActiveTab={setActiveTab}
            transactions={transactions}
            getTransactions={getTransactions}
            cards={cards}
            setShowCardModal={setShowCardModal}
          />
        ) : activeTab === "deposit" || activeTab === "withdraw" ? (
          <DepositWithdraw
            darkMode={darkMode}
            activeTab={activeTab}
            formData={formData}
            handleInputChange={handleInputChange}
            validateAmount={validateAmount}
            amountError={amountError}
            stripePromise={stripePromise}
            handleDeposit={handleDeposit}
            walletLoading={walletLoading}
            getReturnUrl={getReturnUrl}
            accounts={accounts}
            bankLoading={bankLoading}
            handleWithdraw={handleWithdraw}
            currency={currency}
          />
        ) : (
          <GroupTransfer
            darkMode={darkMode}
            groups={groups}
            currentGroup={currentGroup}
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
            formData={formData}
            handleInputChange={handleInputChange}
            handleGroupTransfer={handleGroupTransfer}
            walletLoading={walletLoading}
            groupsLoading={groupsLoading}
            isGroupMember={isGroupMember}
            currency={currency}
          />
        )}
      </div>
    </div>
  );
};

export default Wallet;
